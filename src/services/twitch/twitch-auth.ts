import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

interface TwitchAppToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUserToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

interface StoredTwitchUserToken extends TwitchUserToken {
  expires_at: string;
}

let cachedToken: {
  accessToken: string;
  expiresAt: number;
} | null = null;

let pendingTwitchAuthState: string | null = null;

const twitchRedirectUri =
  process.env.TWITCH_REDIRECT_URI ??
  "http://localhost:3000/auth/twitch/callback";

const tokenStorePath = path.join(process.cwd(), "data", "twitch-user-token.json");

function getTwitchClientCredentials() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variable",
    );
  }

  return { clientId, clientSecret };
}

export async function getTwitchAppAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const { clientId, clientSecret } = getTwitchClientCredentials();

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

export function getTwitchAuthorizationUrl(): string {
  const { clientId } = getTwitchClientCredentials();
  pendingTwitchAuthState = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: twitchRedirectUri,
    response_type: "code",
    scope: "channel:read:redemptions",
    state: pendingTwitchAuthState,
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

export function verifyTwitchAuthorizationState(state: string): boolean {
  if (!pendingTwitchAuthState || pendingTwitchAuthState !== state) {
    return false;
  }

  pendingTwitchAuthState = null;
  return true;
}

export async function exchangeTwitchCodeForUserToken(
  code: string,
): Promise<TwitchUserToken> {
  const { clientId, clientSecret } = getTwitchClientCredentials();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: twitchRedirectUri,
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
      `Twitch user auth failed: ${response.status} ${response.statusText} ${errorBody}`,
    );
  }

  const token = (await response.json()) as TwitchUserToken;
  await saveTwitchUserToken(token);

  return token;
}

export async function getTwitchUserAccessToken(): Promise<string> {
  const token = await readTwitchUserToken();
  const expiresAt = new Date(token.expires_at).getTime();

  if (expiresAt > Date.now() + 60_000) {
    return token.access_token;
  }

  const refreshedToken = await refreshTwitchUserToken(token.refresh_token);

  return refreshedToken.access_token;
}

async function refreshTwitchUserToken(
  refreshToken: string,
): Promise<TwitchUserToken> {
  const { clientId, clientSecret } = getTwitchClientCredentials();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
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
      `Twitch token refresh failed: ${response.status} ${response.statusText} ${errorBody}`,
    );
  }

  const token = (await response.json()) as TwitchUserToken;
  await saveTwitchUserToken(token);

  return token;
}

async function readTwitchUserToken(): Promise<StoredTwitchUserToken> {
  try {
    const tokenFile = await fs.readFile(tokenStorePath, "utf8");
    return JSON.parse(tokenFile) as StoredTwitchUserToken;
  } catch {
    throw new Error("No Twitch user token found. Visit /auth/twitch first.");
  }
}

async function saveTwitchUserToken(
  token: TwitchUserToken,
): Promise<StoredTwitchUserToken> {
  await fs.mkdir(path.dirname(tokenStorePath), { recursive: true });

  const storedToken = {
    ...token,
    expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
  };

  await fs.writeFile(tokenStorePath, JSON.stringify(storedToken, null, 2));

  return storedToken;
}
