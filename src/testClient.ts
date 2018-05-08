import {Client} from "./jutsu"
import * as net from "net"



let conn = net.createConnection({
    port: 4000
})

let client = new Client(conn)
client.handle("hello", (data)=>{
    console.log(data)
    console.log("hello called:", data[0].name)
})
client.run()

let data = Buffer.from(JSON.stringify({foo: "bar"}))

client.call("add", data)