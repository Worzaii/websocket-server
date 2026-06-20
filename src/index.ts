import "dotenv/config";
import "./commands";
import { handleCommand } from "./commands/router";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { Command } from "./types/command";
import {
  registerClient,
  getClients,
  removeClient,
} from "./websocket/connection-manager";
import crypto from "crypto";
import {
  exchangeTwitchCodeForUserToken,
  getTwitchAuthorizationUrl,
  verifyTwitchAuthorizationState,
} from "./services/twitch/twitch-auth";

const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

app.get("/health", (_, res) => {
  res.send("OK");
});

app.get("/auth/twitch/callback", async (req, res) => {
  if (typeof req.query.error === "string") {
    res.status(400).send(`Twitch authorization failed: ${req.query.error}`);
    return;
  }

  const code = req.query.code;
  const state = req.query.state;

  if (typeof code !== "string") {
    res.status(400).send("Missing Twitch authorization code");
    return;
  }

  if (typeof state !== "string" || !verifyTwitchAuthorizationState(state)) {
    res.status(400).send("Invalid Twitch authorization state");
    return;
  }

  try {
    const token = await exchangeTwitchCodeForUserToken(code);

    res.send(`
      <h1>Twitch connected</h1>
      <p>Scopes: ${token.scope.join(", ")}</p>
      <p>User token saved on the websocket server.</p>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to exchange Twitch authorization code");
  }
});

app.get("/auth/twitch", (_, res) => {
  res.redirect(getTwitchAuthorizationUrl());
});

wss.on("connection", (ws, req) => {
  const clientId = crypto.randomUUID();

  registerClient({
    id: clientId,
    type: "unknown",
  });

  console.log("Connected clients:", getClients());

  const ip = req.socket.remoteAddress;

  console.log(`Client connected from ${ip}`);
  ws.on("message", async (message) => {
    const text = message.toString();

    console.log(`Received: ${text}`);

    let requestId: string | undefined;

    try {
      const command: Command = JSON.parse(text);
      requestId = command.requestId;

      const response = await handleCommand(command);

      console.log(`Sending: ${JSON.stringify(response)}`);

      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error(error);

      const response = {
        requestId,
        success: false,
        message: error instanceof Error ? error.message : "Command failed",
      };

      console.log(`Sending: ${JSON.stringify(response)}`);

      ws.send(JSON.stringify(response));
    }
  });

  ws.on("close", () => {
    console.log(`Client disconnected from ${ip}`);
    removeClient(clientId);

    console.log("Connected clients:", getClients());
  });
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
