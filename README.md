# jutsu
Jutsu : Bi-directional JSON RPC Library

## Installation
`npm i --save git+ssh://git@github.com/ellcrys/jutsu.git`

## Client 

```ts
import {Client} from "@ellcrys/jutsu"
import * as net from "net"



let conn = net.createConnection({
    port: 4000
})

let client = new Client(conn)

//register 'hello' method
client.handle("hello", (data)=>{
    console.log("hello called:", data.name)
})
client.run()

let data = Buffer.from(JSON.stringify({foo: "bar"}))

//invoke 'add' on the server
client.call("add", data)
```

## Server
```ts
import {Server, Client} from "./jutsu"


let server = new Server()

//register 'add' method
server.handle("add", (client:Client, data) =>{
    const _data = JSON.parse(Buffer.from(data, 'base64').toString())
    console.log("add called: ", "foo")

    //invoke 'hello' method back to client
    client.call("hello", {name: _data.foo})
})

server.connect(4000)
```