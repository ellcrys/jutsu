declare module '@ellcrys/client' {
	/// <reference types="node" />
	import { TSMap } from "typescript-map";
	import * as net from "net";
	import { Server } from '@ellcrys/server';
	export interface Handler {
	    fn: (client: Client, ...args: any[]) => any;
	}
	export class Client {
	    socket: net.Socket;
	    handlers: TSMap<string, Handler>;
	    private eventHub;
	    private count;
	    constructor(socket: net.Socket);
	    handle(method: string, handleFunc: (...args: any[]) => any): void;
	    call(method: string, data: any): void;
	    run(): void;
	    runWithServer(server: Server): void;
	    disconnect(): void;
	}

}
declare module '@ellcrys/server' {
	/// <reference types="node" />
	/// <reference types="pubsub-js" />
	import { TSMap } from "typescript-map";
	import { Client } from '@ellcrys/client';
	import * as net from "net";
	export type Handler = (client: Client, ...args: any[]) => any;
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
	    handlers: TSMap<string, Handler>;
	    eventHub: PubSubJS.Base;
	    private socket;
	    private count;
	    private server;
	    constructor();
	    handle(method: string, handleFunc: (client: Client, ...args: any[]) => any): void;
	    onConnect(func: (client: Client) => void): void;
	    onDisconnect(func: (client: Client) => void): void;
	    connect(port: number, callback?: (server: net.Server) => void): void;
	    onData(callback?: (data: any) => void): void;
	    disconnect(): void;
	}

}
declare module '@ellcrys/jutsu' {
	export { Server } from '@ellcrys/server';
	export { Handler } from '@ellcrys/server';
	export { Client } from '@ellcrys/client';

}
