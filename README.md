# Stream Websocket server and signals handler

This project will be set up and allow for handling the following services:

- Twitch
- Steam
- Warudo
- OBS
- +++?

## Implemented:

- WebSocket command server
- `GET /health` health-check endpoint
- Twitch OAuth authorization flow
- Twitch user, stream-status, and channel-reward commands
- Basic `ping` and payload-echo commands
- A placeholder `warudo.trigger` command

## Planned:

- Delivering commands to Warudo
- OBS scene-change integration
- Twitch redemption event handling
- Steam achievement integration

## Twitch

Allow for listening to redeems on your streams and send signals in the right directions. It should also allow you to
turn on and off specific redeems whenever you change scene in OBS.

Later down the line it could also be set up to help out with giveaways, like other services also do for Twitch by typing
a codename in chat for example.

## Steam

Tracking Achievements and allow interactions towards Twitch/Warudo for the currently played/streamed game.

## Warudo

Allow for communication towards Warudo websockets, like the Warudo Message/Trigger/Toggle commands. It'll be set up to
synchronize between OBS scenes and possible Twitch redeems toggles.

## OBS

Set up listeners for scene changes to toggle or change any of the above services when needed.

### Long story short

It's been a long time coming project that I've wanted to set up for my streams, and I've decided to make it a public
thing to show off what I can do and to learn from it as well.

## Prerequisites

- [Node.js](https://nodejs.org/)
- A Twitch developer application, created in the [Twitch Developer Console](https://dev.twitch.tv/console/apps/create)

In your Twitch application's settings, add the following OAuth redirect URL (or the value you configure with
`TWITCH_REDIRECT_URI`):

```text
http://localhost:3000/auth/twitch/callback
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`.

3. Add the Client ID and Client Secret from your Twitch application:

   ```dotenv
   TWITCH_CLIENT_ID=your_client_id
   TWITCH_CLIENT_SECRET=your_client_secret
   ```

   Optionally, set `TWITCH_REDIRECT_URI` if you use a redirect URL other than the default.

4. Start the development server:

   ```bash
   npm run dev
   ```

The server listens on port `3000`.

## Scripts

| Command                | Description                                            |
|------------------------|--------------------------------------------------------|
| `npm run dev`          | Run the TypeScript server in development mode.         |
| `npm run build`        | Compile TypeScript into `dist/`.                       |
| `npm start`            | Run the compiled server.                               |
| `npm run docker:build` | Builds a dockerfile for the websocket-server           |
| `npm run docker:start` | Starts a finished docker image of the websocket-server |

## Twitch authorization

After starting the server, visit [http://localhost:3000/auth/twitch](http://localhost:3000/auth/twitch) in a browser and
complete Twitch's authorization prompt. The resulting user token is stored locally at `data/twitch-user-token.json` and
is refreshed automatically when needed.

## HTTP endpoints

| Endpoint                    | Description                               |
|-----------------------------|-------------------------------------------|
| `GET /health`               | Returns `OK` when the server is running.  |
| `GET /auth/twitch`          | Starts Twitch authorization.              |
| `GET /auth/twitch/callback` | Receives Twitch's authorization response. |

## WebSocket commands

Connect a WebSocket client to `ws://localhost:3000`. Commands use this format:

```json
{
  "requestId": "unique-request-id",
  "action": "ping",
  "payload": {}
}
```

Every response includes the original `requestId`, a `success` boolean, and optional `message` and `data` fields.

### Available commands

| Action                 | Payload                                                                   | Description                                                                   |
|------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| `ping`                 | None                                                                      | Returns `pong`.                                                               |
| `command-payload`      | Any value                                                                 | Returns the payload as a message.                                             |
| `twitch.user.info`     | `{ "login": "channel_name" }`                                             | Retrieves a Twitch user. If omitted, it looks up `yourchannel`.               |
| `twitch.stream.status` | `{ "login": "channel_name" }`                                             | Retrieves the channel's live status.                                          |
| `twitch.stream.info`   | `{ "login": "channel_name" }`                                             | Alias for `twitch.stream.status`.                                             |
| `twitch.rewards.list`  | `{ "broadcasterLogin": "channel_name" }` or `{ "login": "channel_name" }` | Lists channel-point rewards. Requires Twitch authorization.                   |
| `warudo.trigger`       | Any value                                                                 | Currently acknowledges the command; it does not yet send a message to Warudo. |

Example request:

```json
{
  "requestId": "ping-1",
  "action": "ping"
}
```

Example response:

```json
{
  "requestId": "ping-1",
  "success": true,
  "message": "pong"
}
```