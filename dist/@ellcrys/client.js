"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_map_1 = require("typescript-map");
var PubSub = require("pubsub-js");
var Client = /** @class */ (function () {
    function Client(socket) {
        var _this = this;
        this.socket = socket;
        this.eventHub = PubSub;
        this.handlers = new typescript_map_1.TSMap();
        this.count = 0;
        this.eventHub.subscribe("client.data", function (msg, buf) {
            var payload = JSON.parse(buf.toString());
            var resp = {
                method: payload.method,
                params: payload.params,
                id: _this.count++
            };
            if (_this.handlers.has(resp.method)) {
                _this.handlers.get(resp.method).fn(resp.params);
            }
        });
    }
    Client.prototype.handle = function (method, handleFunc) {
        if (this.handlers.has(method)) {
            throw new Error("Jutsu: multiple registrations for " + method);
        }
        this.handlers.set(method, {
            fn: handleFunc
        });
    };
    Client.prototype.call = function (method, data) {
        var req = {
            method: method,
            params: [data],
            id: this.count++
        };
        console.log(req);
        var buf = Buffer.from(JSON.stringify(req) + "\n");
        this.socket.write(buf);
    };
    Client.prototype.run = function () {
        var _this = this;
        this.socket.on("connect", function () {
            console.log("Jutsu Connected √");
        });
        this.socket.on("data", function (buf) {
            _this.eventHub.publish("client.data", buf);
        });
    };
    Client.prototype.runWithServer = function (server) {
        var _this = this;
        this.socket.on("connect", function () {
            console.log("Jutsu Connected √");
            server.eventHub.publish("server.connected", {
                Client: _this
            });
        });
        this.socket.on("end", function () {
            console.log("Jutsu disconnected X");
            server.eventHub.publish("server.disconnected", {
                Client: _this
            });
        });
        this.socket.on("data", function (buf) {
            server.eventHub.publish("server.data", {
                Client: _this,
                Data: buf
            });
        });
    };
    return Client;
}());
exports.Client = Client;
