import {TSMap} from "typescript-map"
import { Client } from "./client";
import * as net from "net"

import * as PubSub from "pubsub-js"

export interface Handler {
    fn: (client: Client, ...args:any[])=>any
}

export interface ConnectionEvent {
    Client:Client
}

export interface DisconnectionEvent {
    Client:Client
}

export interface OnDataEvent {
    Client:Client
    Data: Buffer
}

interface Response {
    method:string,
    params: any,
    id: number
}

export class Server{

    private handlers:TSMap<string, Handler>

    eventHub:PubSubJS.Base;

    private socket: net.Socket

    private count:number

    constructor(){
        this.eventHub = PubSub
        this.handlers = new TSMap<string, Handler>()
        this.socket  = new net.Socket()
        this.count = 0; 

        this.onData()
    }


    handle(method:string, handleFunc:(client: Client, ...args:any[])=>any){

        if(this.handlers.has(method)){
            throw new Error(`Jutsu: multiple registrations for ${method}`)
        }

        this.handlers.set(method, {
            fn: handleFunc
        })

    }

    onConnect(func: (client:Client)=>void) {
        this.eventHub.subscribe("server.connected", (msg:any, data:ConnectionEvent)=>{
            func(data.Client)
        })
    }

    onDisconnect(func: (client:Client)=>void) {
        this.eventHub.subscribe("server.disconnected", (msg:any, data:DisconnectionEvent)=>{
            func(data.Client)
        })
    }
    
    connect(port:number){
        const self = this;
        
        const listener = (socket: net.Socket) =>{
            const client = new Client(socket)
            client.runWithServer(self);
            self.socket = socket
        }

        let server = net.createServer(listener)
        server.on("error", (err)=>{
            throw new Error(`Jutsu error: ${err.message}`)
        })
        server = server.listen(port, ()=>{
            console.log("Jutsu OK: Opened server on", server.address().address, server.address().port)
        })
    }

    onData(callback?:(data:any)=>void){
        this.eventHub.subscribe("server.data", (msg:any, data:OnDataEvent)=>{
            
            const payload = JSON.parse(data.Data.toString())
            const resp:Response = {
                method: payload.method,
                params: payload.params,
                id: this.count++
            }
           
            if(this.handlers.has(resp.method)){
                this.handlers.get(resp.method).fn(data.Client, resp.params)

                if (callback != null ) { callback(resp.params) }
            }
        })
    }

    

}