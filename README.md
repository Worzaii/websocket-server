# Stream Websocket server and signals handler

This project will be set up and allow for handling the following services:

- Twitch
- Steam
- Warudo
- OBS
- +++?

## Twitch

Allow for listening to redeems on your streams and send signals in the right directions. It should also allow you to turn on and off specific redeems whenever you change scene in OBS.

Later down the line it could also be set up to help out with giveaways, like other services also do for Twitch by typing a codename in chat for example.

## Steam

Tracking Achievements and allow interactions towards Twitch/Warudo for the currently played/streamed game.

## Warudo

Allow for communication towards Warudo websockets, like the Warudo Message/Trigger/Toggle commands. It'll be set up to synchronize between OBS scenes and possible Twitch redeems toggles.

## OBS

Set up listeners for scene changes to toggle or change any of the above services when needed.

### Long story short

It's been a long time coming project that I've wanted to set up for my streams, and I've decided to make it a public thing to show off what I can do and to learn from it as well.

## Setup

Make sure to have an application over on Twitch [here](https://dev.twitch.tv/console/apps/create), you'll need to fill out your TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in the .env file you'll need to create, copy this from the .env.example file in the root directory.
