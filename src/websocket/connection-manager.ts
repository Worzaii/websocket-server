export interface ClientInfo {
  id: string;
  type: string;
}

const clients = new Map<string, ClientInfo>();

export function registerClient(client: ClientInfo) {
  clients.set(client.id, client);
}

export function removeClient(id: string) {
  clients.delete(id);
}

export function getClients() {
  return Array.from(clients.values());
}
