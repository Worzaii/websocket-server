import { registerCommand } from "../router";
import { twitchClient } from "../../services/twitch/twitch-client";
import { Command, CommandResponse } from "../../types/command";

function getLogin(command: Command): string | undefined {
  if (
    typeof command.payload === "object" &&
    command.payload !== null &&
    "login" in command.payload &&
    typeof command.payload.login === "string"
  ) {
    return command.payload.login;
  }

  return undefined;
}

async function handleStreamStatus(command: Command): Promise<CommandResponse> {
  const login = getLogin(command);

  if (!login) {
    return {
      requestId: command.requestId,
      success: false,
      message: "Missing Twitch login",
    };
  }

  const stream = await twitchClient.getStreamByLogin(login);

  if (!stream) {
    return {
      requestId: command.requestId,
      success: true,
      message: "Not Live",
      data: {
        login,
        live: false,
      },
    };
  }

  return {
    requestId: command.requestId,
    success: true,
    message: `Live: \n${stream.viewer_count}`,
    data: {
      login,
      live: true,
      stream,
    },
  };
}

registerCommand("twitch.stream.status", handleStreamStatus);
registerCommand("twitch.stream.info", handleStreamStatus);
