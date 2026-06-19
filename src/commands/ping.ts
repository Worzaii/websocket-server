import { registerCommand } from "./router";

registerCommand("ping", async (command) => {
  return {
    requestId: command.requestId,
    success: true,
    message: "pong",
  };
});
