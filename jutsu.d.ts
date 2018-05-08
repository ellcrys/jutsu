declare module '@ellcrys/client' {
	/// <reference types="node" />
	import * as net from "net";
	import { Server } from '@ellcrys/server';
	export interface Handler {
	    fn: (client: Client, ...args: any[]) => any;
	}
	export class Client {
	    private socket;
	    private handlers;
	    private eventHub;
	    private count;
	    constructor(socket: net.Socket);
	    handle(method: string, handleFunc: (...args: any[]) => any): void;
	    call(method: string, data: any): void;
	    run(): void;
	    runWithServer(server: Server): void;
	}

}
declare module '@ellcrys/server' {
	/// <reference types="node" />
	/// <reference types="pubsub-js" />
	import { Client } from '@ellcrys/client';
	export interface Handler {
	    fn: (client: Client, ...args: any[]) => any;
	}
	export interface ConnectionEvent {
	    Client: Client;
	}
	export interface DisconnectionEvent {
	    Client: Client;
	}
	export interface OnDataEvent {
	    Client: Client;
	    Data: Buffer;
	}
	export class Server {
	    private handlers;
	    eventHub: PubSubJS.Base;
	    private socket;
	    private count;
	    constructor();
	    handle(method: string, handleFunc: (client: Client, ...args: any[]) => any): void;
	    onConnect(func: (client: Client) => void): void;
	    onDisconnect(func: (client: Client) => void): void;
	    connect(port: number): void;
	    onData(callback?: (data: any) => void): void;
	}

}
declare module '@ellcrys/jutsu' {
	export { Server } from '@ellcrys/server';
	export { Client } from '@ellcrys/client';

}
