import { registerCommand } from "./router";

registerCommand("command-payload", async (command) => {
  return {
    requestId: command.requestId,
    success: true,
    message: String(command.payload),
  };
});
