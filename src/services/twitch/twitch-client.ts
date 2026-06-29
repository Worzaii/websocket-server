import {
  getTwitchAppAccessToken,
  getTwitchUserAccessToken,
} from "./twitch-auth";

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchCustomReward {
  id: string;
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  title: string;
  prompt: string;
  cost: number;
  is_enabled: boolean;
  is_paused: boolean;
  is_in_stock: boolean;
}

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

  async getCustomRewards(
    broadcasterId: string,
  ): Promise<TwitchCustomReward[]> {
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
