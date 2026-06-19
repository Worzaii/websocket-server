import { registerCommand } from "./router";

registerCommand("warudo.trigger", async (command) => {
  console.log("Warudo trigger requested", command.payload);

  return {
    success: true,
    message: "Warudo trigger received",
  };
});
