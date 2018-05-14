import {TSMap} from "typescript-map"
import { Client } from "./client";
import * as net from "net"

import * as PubSub from "pubsub-js"

// export interface Handler {
//     fn: 
// }


export type Handler = (client: Client, ...args:any[])=>any

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

    handlers:TSMap<string, Handler>

    eventHub:PubSubJS.Base;

    private socket: net.Socket

    private count:number

    private server: net.Server

    constructor(){
        this.eventHub = PubSub
        this.handlers = new TSMap<string, Handler>()
        this.socket  = new net.Socket({
            allowHalfOpen: false
        })
        this.count = 0; 

        this.server = net.createServer()

        this.onData()
    }


    handle(method:string, handleFunc:(client: Client, ...args:any[])=>any){

        if(this.handlers.has(method)){
            throw new Error(`Jutsu: multiple registrations for ${method}`)
        }

        this.handlers.set(method, handleFunc)

    }

    onConnect(func: (client:Client)=>void) {
        console.log(func)
        this.eventHub.subscribe("server.connected", (msg:any, data:ConnectionEvent)=>{
            func(data.Client)
        })
    }

    onDisconnect(func: (client:Client)=>void) {
        this.eventHub.subscribe("server.disconnected", (msg:any, data:DisconnectionEvent)=>{
            func(data.Client)
        })
    }
    
    connect(port:number, callback?:(server:net.Server)=>void){
        const self = this;
        
        const listener = (socket: net.Socket) =>{
            const client = new Client(socket)
            client.runWithServer(self);
            self.socket = socket
        }

        this.server = net.createServer(listener)
        this.server.on("error", (err)=>{
            throw new Error(`Jutsu error: ${err.message}`)
        })
        this.server.listen(port, ()=>{
            console.log("Jutsu OK: Opened server on", this.server.address().address, this.server.address().port)
        })

        if(callback){
            callback(this.server)
        }
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
                this.handlers.get(resp.method).call(this, data.Client, resp.params)

                if (callback != null ) { callback(resp.params) }
            }
        })
    }


    disconnect(){
        this.server.close()
    }

    

}