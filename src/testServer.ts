
import {Server, Client} from "./jutsu"


let server = new Server()

server.handle("add", (client:Client, data) =>{
    //console.log(Buffer.from(data[0], 'base64').toString())
    const _data = JSON.parse(Buffer.from(data[0], 'base64').toString())
    console.log("add called: ", "foo")

    //talk back to client
    client.call("hello", {name: _data.foo})
})

server.connect(4000)