import { TSMap } from "typescript-map"
import * as net from "net"

import * as PubSub from "pubsub-js"
import { Server } from "./server";

export interface Handler {
    fn: (client: Client, ...args: any[]) => any
}


interface Request {
    method: string,
    data: any
}

interface Response {
    method: string,
    data: any
}

export class Client {

    private handlers: TSMap<string, Handler>

    private eventHub: PubSubJS.Base;

    

    constructor(private socket: net.Socket) {
        this.eventHub = PubSub
        this.handlers = new TSMap<string, Handler>()

        this.eventHub.subscribe("client.data", (msg:any, buf: Buffer) => {
            
            const payload = JSON.parse(buf.toString())
            const resp: Response = {
                method: payload.method,
                data: payload.data
            }

            if (this.handlers.has(resp.method)) {
                this.handlers.get(resp.method).fn(resp.data)
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
            data: data
        }
        const buf = Buffer.from(JSON.stringify(req))

        this.socket.write(buf)
    }



    run() {
        this.socket.on("connect", () => {
            console.log("Jutsu Connected √")
        })

        this.socket.on("data", (buf: Buffer) => {
            this.eventHub.publish("client.data", buf)
            this.socket.end()
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

            this.socket.end()
        })
    }
}