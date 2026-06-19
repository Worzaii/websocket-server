export interface Command {
  action: string;
  payload?: unknown;
}
export interface CommandResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}
