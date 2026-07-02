import {
  getTwitchAppAccessToken,
  getTwitchUserAccessToken,
} from "./twitch-auth";
import type {
  TwitchUser,
  TwitchStream,
  TwitchCustomReward,
} from "./twitch-types";

export class TwitchClient {
  async getUser(login: string): Promise<TwitchUser | undefined> {
    const data = await this.getHelixData(
      `/users?login=${encodeURIComponent(login)}`,
    );

    return data.data?.[0];
  }

  async getStreamByLogin(login: string): Promise<TwitchStream | undefined> {
    const data = await this.getHelixData(
      `/streams?user_login=${encodeURIComponent(login)}`,
    );

    return data.data?.[0];
  }

  async getCustomRewards(broadcasterId: string): Promise<TwitchCustomReward[]> {
    const data = await this.getHelixData(
      `/channel_points/custom_rewards?broadcaster_id=${encodeURIComponent(
        broadcasterId,
      )}`,
      "user",
    );

    return data.data ?? [];
  }

  private async getHelixData(path: string, tokenType: "app" | "user" = "app") {
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error("Missing TWITCH_CLIENT_ID environment variable");
    }

    const accessToken =
      tokenType === "user"
        ? await getTwitchUserAccessToken()
        : await getTwitchAppAccessToken();
    const response = await fetch(`https://api.twitch.tv/helix${path}`, {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Twitch request failed: ${response.status} ${response.statusText} ${errorBody}`,
      );
    }

    return response.json();
  }
}

export const twitchClient = new TwitchClient();
