import { TSMap } from "typescript-map"
import * as net from "net"

import * as PubSub from "pubsub-js"
import { Server } from "./server";

export interface Handler {
    fn: (client: Client, ...args: any[]) => any
}


interface Request {
    method: string,
    params: any,
    id:number
}

interface Response {
    method: string,
    params: any,
    id:number
}

export class Client {

    handlers: TSMap<string, Handler>

    private eventHub: PubSubJS.Base;

    private count:number;

    constructor(public socket: net.Socket) {
        this.eventHub = PubSub
        this.handlers = new TSMap<string, Handler>()
        this.count = 0
        this.eventHub.subscribe("client.data", (msg:any, buf: Buffer) => {
            
            const payload = JSON.parse(buf.toString())
            const resp: Response = {
                method: payload.method,
                params: payload.params,
                id: this.count++
            }

            if (this.handlers.has(resp.method)) {
                this.handlers.get(resp.method).fn(resp.params)
            }
        })


        
    }

    handle(method: string, handleFunc: (...args: any[]) => any) {

        if (this.handlers.has(method)) {
            throw new Error(`Jutsu: multiple registrations for ${method}`)
        }

        this.handlers.set(method, {
            fn: handleFunc
        })

    }


    call(method: string, data: any) {
        const req: Request = {
            method: method,
            params: [data],
            id: this.count++
        }

       const bool = this.socket.write(JSON.stringify(req)+"\r\n")
     
    }



    run() {
        this.socket.on("connect", () => {
            console.log("Jutsu Connected √")
        })

        this.socket.on("data", (buf: Buffer) => {
            this.eventHub.publish("client.data", buf)
        })

        this.socket.on("end", (buf: Buffer) => {
            
        })
    }

    runWithServer(server: Server) {
    
        this.socket.on("connect", () => {
            console.log("Jutsu Connected √")
            server.eventHub.publish("server.connected", {
                Client: this
            })
        })

        this.socket.on("end", () => {
            console.log("Jutsu disconnected X")
            server.eventHub.publish("server.disconnected", {
                Client: this
            })
        })

        this.socket.on("data", (buf: Buffer) => {
            server.eventHub.publish("server.data", {
                Client: this,
                Data: buf
            })
        })
    }

    disconnect(){
        this.socket.destroy()
    }
}