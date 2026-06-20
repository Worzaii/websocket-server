import { getTwitchAppAccessToken } from "./twitch-auth";

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

export class TwitchClient {
  async getUser(login: string) {
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

  private async getHelixData(path: string) {
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error("Missing TWITCH_CLIENT_ID environment variable");
    }

    const accessToken = await getTwitchAppAccessToken();
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
