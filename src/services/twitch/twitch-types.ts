export interface TwitchAppToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface TwitchUserToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

export interface StoredTwitchUserToken extends TwitchUserToken {
  expires_at: string;
}

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
}

export interface TwitchStream {
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

export interface TwitchCustomReward {
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
