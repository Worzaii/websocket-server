export interface Command {
  requestId: string;
  action: string;
  payload?: unknown;
}
export interface CommandResponse {
  requestId: string;
  success: boolean;
  message?: string;
  data?: unknown;
}
