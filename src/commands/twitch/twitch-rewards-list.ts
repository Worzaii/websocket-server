import { registerCommand } from "../router";
import { twitchClient } from "../../services/twitch/twitch-client";
import { Command, CommandResponse } from "../../types/command";

function getBroadcasterLogin(command: Command): string | undefined {
  if (
    typeof command.payload === "object" &&
    command.payload !== null &&
    "broadcasterLogin" in command.payload &&
    typeof command.payload.broadcasterLogin === "string"
  ) {
    return command.payload.broadcasterLogin;
  }

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

async function handleRewardsList(command: Command): Promise<CommandResponse> {
  const broadcasterLogin = getBroadcasterLogin(command);

  if (!broadcasterLogin) {
    return {
      requestId: command.requestId,
      success: false,
      message: "Missing broadcaster login",
    };
  }

  const broadcaster = await twitchClient.getUser(broadcasterLogin);

  if (!broadcaster) {
    return {
      requestId: command.requestId,
      success: false,
      message: `No Twitch user found for ${broadcasterLogin}`,
    };
  }

  const rewards = await twitchClient.getCustomRewards(broadcaster.id);
  const rewardTitles = rewards.map((reward) => reward.title);

  return {
    requestId: command.requestId,
    success: true,
    message: rewards.length === 1 ? "1 reward" : `${rewards.length} rewards`,
    data: {
      broadcaster: {
        id: broadcaster.id,
        login: broadcaster.login,
        displayName: broadcaster.display_name,
      },
      rewards,
      rewardTitles,
    },
  };
}

registerCommand("twitch.rewards.list", handleRewardsList);
