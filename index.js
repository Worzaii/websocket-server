const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.get("/health", (req, res) => {
    res.send("OK");
});

wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    ws.send("I can verify that you've connected to the WebSocket server! To check for reply, send me the codeword 'ping' and I'll reply with 'pong'.");
    console.log(`Client connected from ${ip}`);
    ws.on("message", (message) => {
        const text = message.toString();
        if (text === "ping") {
            ws.send("pong");
        }
    });
    ws.on('error', console.error);
    ws.on("close", () => {
    console.log(`Client from ${ip} disconnected`);
});
});

server.listen(3000, () => {
    console.log("Listening on port 3000");
});