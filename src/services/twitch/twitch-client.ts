import { getTwitchAppAccessToken } from "./twitch-auth";

export class TwitchClient {
  async getUser(login: string) {
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) {
      throw new Error("Missing TWITCH_CLIENT_ID environment variable");
    }

    const accessToken = await getTwitchAppAccessToken();
    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Twitch request failed: ${response.status} ${response.statusText} ${errorBody}`,
      );
    }

    const data = await response.json();

    return data.data?.[0];
  }
}

export const twitchClient = new TwitchClient();
