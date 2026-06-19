import { registerCommand } from "./router";

registerCommand("ping", async () => {
  return {
    success: true,
    message: "pong",
  };
});
