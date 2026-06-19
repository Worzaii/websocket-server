import { Command, CommandResponse } from "../types/command";

type CommandHandler = (command: Command) => Promise<CommandResponse>;

const handlers = new Map<string, CommandHandler>();

export function registerCommand(action: string, handler: CommandHandler) {
  console.log(`Registering command: ${action}`);
  handlers.set(action, handler);
}

export async function handleCommand(
  command: Command,
): Promise<CommandResponse> {
  const handler = handlers.get(command.action);

  if (!handler) {
    return {
      requestId: command.requestId,
      success: false,
      message: `Unknown action: ${command.action}`,
    };
  }

  return handler(command);
}
