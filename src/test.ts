import { expect } from 'chai'
import { Server, Handler, Client } from './jutsu'
import 'mocha'
import * as sinon from 'sinon'
import * as net from 'net'
import { TSMap } from 'typescript-map';


let ServerHandlerStub: sinon.SinonStub;
let ClientRunStub: sinon.SinonStub;
let ClientHandleStub: sinon.SinonStub;
let ClientRunWithServerStub: sinon.SinonStub;

const serverInstance = new Server()

let clientInstance:Client;

let invokeSpy:sinon.SinonSpy;


describe('Jutsu Server', () => {
    beforeEach(() => {
        ServerHandlerStub = sinon.stub(serverInstance, "handle")
        serverInstance.connect(4100, (s)=>{})
    })

    afterEach(() => {
        ServerHandlerStub.restore()
        serverInstance.disconnect()
    })

    it('should bind a handler to the server', () => {
        serverInstance.handle("myhandler", (client: Client, ...args: any[]) => { })
        expect(ServerHandlerStub.calledOnce).is.true
    })

})


describe('Justsu Client', ()=>{
    beforeEach(() => {
        serverInstance.connect(4100)
        let conn = net.createConnection({
            port: 4100
        })
        clientInstance = new Client(conn) 
        ClientRunStub = sinon.stub(clientInstance, "run")
        ClientHandleStub = sinon.stub(clientInstance, "handle")
        ClientRunWithServerStub = sinon.stub(clientInstance, "runWithServer")
    })

    afterEach(() => {
        serverInstance.disconnect()
        clientInstance.disconnect()
        ClientRunStub.restore()
        ClientHandleStub.restore()
        ClientRunWithServerStub.restore()
        serverInstance.handlers.delete("doSomething")
    })


    it('should run client listeners', () => {
        clientInstance.run()
        expect(ClientRunStub.calledOnce).is.equal(true) 
    })


    it('should bind a handler to the client', () => {
        clientInstance.handle("myhandler", (client: Client, ...args: any[]) => { 
            console.log(args)
        })
        expect(ClientHandleStub.calledOnce).to.equal(true)
    })

    it('should run client listeners with server', () => {
        ClientRunWithServerStub.withArgs(serverInstance)
        clientInstance.runWithServer(serverInstance)
        expect(ClientRunWithServerStub.calledOnce).is.equal(true)
    })

    it('client should call handler doSomething on the server', (done) => {
        invokeSpy = sinon.spy()
        let handler = (client:Client, data:any)=>{
            invokeSpy()
            done()
        }
       
        serverInstance.handle("doSomething", handler)
        clientInstance.run()

        clientInstance.call("doSomething", Buffer.from(JSON.stringify({})))
        
        expect(serverInstance.handlers.get("doSomething")).is.not.undefined
        
        setTimeout(()=>{
            expect(invokeSpy.called).is.true
        }, 10)
    })

    it("should trigger onData function on server", (done)=>{

        let callBackSpy = sinon.spy()
        const onDataCallback = (data:any)=>{
            callBackSpy()
            done()
        }
        serverInstance.onData(onDataCallback)
        serverInstance.handle("doSomething",(client:Client, data:any)=>{})
        clientInstance.run()

        clientInstance.call("doSomething", Buffer.from(JSON.stringify({})))

        setTimeout(()=>{
            expect(callBackSpy.called).is.true
        }, 10)
    })

    it("should trigger onDisconnect function on server when client disconnects", (done)=>{

        let callBackSpy = sinon.spy()
        const onDisconnectCallback = (data:any)=>{
            callBackSpy()
            done()
        }
        serverInstance.onDisconnect(onDisconnectCallback)
        clientInstance.runWithServer(serverInstance)

        setTimeout(()=>{
            clientInstance.disconnect()
        }, 10)
       

        setTimeout(()=>{
            expect(callBackSpy.called).is.true
        }, 50)
    })
})
