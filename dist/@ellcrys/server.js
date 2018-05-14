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
        this.socket = new net.Socket({
            allowHalfOpen: false
        });
        this.count = 0;
        this.server = net.createServer();
        this.onData();
    }
    Server.prototype.handle = function (method, handleFunc) {
        if (this.handlers.has(method)) {
            throw new Error("Jutsu: multiple registrations for " + method);
        }
        this.handlers.set(method, handleFunc);
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
    Server.prototype.connect = function (port, callback) {
        var _this = this;
        var self = this;
        var listener = function (socket) {
            var client = new client_1.Client(socket);
            client.runWithServer(self);
            self.socket = socket;
        };
        this.server = net.createServer(listener);
        this.server.on("error", function (err) {
            throw new Error("Jutsu error: " + err.message);
        });
        this.server.listen(port, function () {
            console.log("Jutsu OK: Opened server on", _this.server.address().address, _this.server.address().port);
        });
        if (callback) {
            callback(this.server);
        }
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
                _this.handlers.get(resp.method).call(_this, data.Client, resp.params);
                if (callback != null) {
                    callback(resp.params);
                }
            }
        });
    };
    Server.prototype.disconnect = function () {
        this.server.close();
    };
    return Server;
}());
exports.Server = Server;
