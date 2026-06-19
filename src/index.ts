import "./commands";
import { handleCommand } from "./commands/router";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { Command } from "./types/command";

const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

app.get("/health", (_, res) => {
  res.send("OK");
});

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;

  console.log(`Client connected from ${ip}`);
  ws.on("message", async (message) => {
    const text = message.toString();

    console.log(`Received: ${text}`);

    try {
      const command: Command = JSON.parse(text);

      const response = await handleCommand(command);

      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error(error);

      ws.send(
        JSON.stringify({
          success: false,
          message: "Invalid command format",
        }),
      );
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected from ${ip}`);
  });
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
