interface TwitchAppToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

export async function getTwitchAppAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variable",
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Twitch auth failed: ${response.status} ${response.statusText} ${errorBody}`,
    );
  }

  const token = (await response.json()) as TwitchAppToken;

  cachedToken = {
    accessToken: token.access_token,
    expiresAt: Date.now() + (token.expires_in - 60) * 1000,
  };

  return cachedToken.accessToken;
}
