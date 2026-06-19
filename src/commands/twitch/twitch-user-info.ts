import { registerCommand } from "../router";
import { twitchClient } from "../../services/twitch/twitch-client";
registerCommand("twitch.user.info", async () => {
  return twitchClient.getUserInfo();
});
