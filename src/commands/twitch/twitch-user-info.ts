import { registerCommand } from "../router";
import { twitchClient } from "../../services/twitch/twitch-client";
import { CommandResponse } from "../../types/command";

registerCommand(
  "twitch.user.info",
  async (command): Promise<CommandResponse> => {
    const login =
      typeof command.payload === "object" &&
      command.payload !== null &&
      "login" in command.payload &&
      typeof command.payload.login === "string"
        ? command.payload.login
        : "yourchannel";

    const user = await twitchClient.getUser(login);

    return {
      requestId: command.requestId,
      success: true,
      message: user?.display_name ?? `No Twitch user found for ${login}`,
      data: user,
    };
  },
);
