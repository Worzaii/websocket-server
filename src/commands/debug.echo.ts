import { registerCommand } from "./router";

registerCommand("debug.echo", async (command) => {
  return {
    requestId: command.requestId,
    success: true,
    message: String(command.payload),
  };
});
