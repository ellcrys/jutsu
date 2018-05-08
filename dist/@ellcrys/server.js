"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_map_1 = require("typescript-map");
var client_1 = require("./client");
var net = require("net");
var PubSub = require("pubsub-js");
var Server = /** @class */ (function () {
    function Server() {
        this.eventHub = PubSub;
        this.handlers = new typescript_map_1.TSMap();
        this.socket = new net.Socket();
        this.count = 0;
        this.onData();
    }
    Server.prototype.handle = function (method, handleFunc) {
        if (this.handlers.has(method)) {
            throw new Error("Jutsu: multiple registrations for " + method);
        }
        this.handlers.set(method, {
            fn: handleFunc
        });
    };
    Server.prototype.onConnect = function (func) {
        this.eventHub.subscribe("server.connected", function (msg, data) {
            func(data.Client);
        });
    };
    Server.prototype.onDisconnect = function (func) {
        this.eventHub.subscribe("server.disconnected", function (msg, data) {
            func(data.Client);
        });
    };
    Server.prototype.connect = function (port) {
        var self = this;
        var listener = function (socket) {
            var client = new client_1.Client(socket);
            client.runWithServer(self);
            self.socket = socket;
        };
        var server = net.createServer(listener);
        server.on("error", function (err) {
            throw new Error("Jutsu error: " + err.message);
        });
        server = server.listen(port, function () {
            console.log("Jutsu OK: Opened server on", server.address().address, server.address().port);
        });
    };
    Server.prototype.onData = function (callback) {
        var _this = this;
        this.eventHub.subscribe("server.data", function (msg, data) {
            var payload = JSON.parse(data.Data.toString());
            var resp = {
                method: payload.method,
                params: payload.params,
                id: _this.count++
            };
            if (_this.handlers.has(resp.method)) {
                _this.handlers.get(resp.method).fn(data.Client, resp.params);
                if (callback != null) {
                    callback(resp.params);
                }
            }
        });
    };
    return Server;
}());
exports.Server = Server;
