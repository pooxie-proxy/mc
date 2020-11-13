// Generated by CoffeeScript 2.5.1
(function() {
  module.exports = function(config) {
    var Chunk, Convert, app, convert, express, fs, http, io, mineflayer, port, server, sf, socketInfo, vec3;
    fs = require("fs");
    http = require("http");
    server = http.createServer();
    io = require("socket.io")(server);
    express = require('express');
    app = express();
    mineflayer = require('mineflayer');
    Chunk = require("prismarine-chunk")("1.16.1");
    vec3 = require("vec3");
    Convert = require('ansi-to-html');
    convert = new Convert();
    sf = {};
    port = config["express-port"];
    socketInfo = {};
    app.use(express.static(__dirname + "/client/"));
    app.use(function(req, res, next) {
      res.set('Cache-Control', 'no-store');
      return next();
    });
    app.get("/websocket/", function(req, res) {
      return res.send(String(config["websocket-port"]));
    });
    app.get("/host/", function(req, res) {
      return res.send(String(config["host"]));
    });
    app.listen(port);
    server.listen(config["websocket-port"]);
    return io.sockets.on("connection", function(socket) {
      socket.on("initClient", function(data) {
        console.log("[+] " + data.nick);
        socketInfo[socket.id] = data;
        socketInfo[socket.id].bot = mineflayer.createBot({
          host: config.realServer.ip,
          port: config.realServer.port,
          username: socketInfo[socket.id].nick,
          version: "1.16.3"
        });
        socketInfo[socket.id].bot._client.on("map_chunk", function(packet) {
          var cell;
          cell = new Chunk();
          cell.load(packet.chunkData, packet.bitMap, false, true);
          io.to(socket.id).emit("mapChunk", cell.sections, packet.x, packet.z, packet.biomes);
        });
        socketInfo[socket.id].bot.on('chat', function(username, message) {
          if (username === socketInfo[socket.id].bot.username) {
            return;
          }
        });
        socketInfo[socket.id].bot.on('move', function() {
          try {
            io.to(socket.id).emit("move", socketInfo[socket.id].bot.entity.position);
          } catch (error) {}
        });
        socketInfo[socket.id].bot.on('health', function() {
          try {
            io.to(socket.id).emit("hp", socketInfo[socket.id].bot.health);
            io.to(socket.id).emit("food", socketInfo[socket.id].bot.food);
          } catch (error) {}
        });
        socketInfo[socket.id].bot.on('spawn', function() {
          try {
            io.to(socket.id).emit("spawn");
          } catch (error) {}
        });
        socketInfo[socket.id].bot.on('message', function(msg) {
          try {
            io.to(socket.id).emit("msg", convert.toHtml(msg.toAnsi()));
          } catch (error) {}
        });
        socketInfo[socket.id].bot.on('experience', function() {
          try {
            io.to(socket.id).emit("xp", socketInfo[socket.id].bot.experience);
          } catch (error) {}
        });
        socketInfo[socket.id].bot.on('blockUpdate', function(oldb, newb) {
          io.to(socket.id).emit("blockUpdate", [newb.position.x, newb.position.y, newb.position.z, newb.stateId]);
        });
      });
      socket.on("move", function(state, toggle) {
        try {
          socketInfo[socket.id].bot.setControlState(state, toggle);
        } catch (error) {}
      });
      socket.on("rotate", function(data) {
        try {
          socketInfo[socket.id].bot.look(...data);
        } catch (error) {}
      });
      return socket.on("disconnect", function() {
        try {
          //end bot session
          console.log("[-] " + socketInfo[socket.id].nick);
          socketInfo[socket.id].bot.end();
          //delete socketinfo
          delete socketInfo[socket.id];
        } catch (error) {}
      });
    });
  };

}).call(this);
