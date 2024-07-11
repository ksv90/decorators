export interface HttpConnectorOptions {
  url?: string;
}

export interface IHttpConnector {
  get url(): string;
  set url(value: string);
  request(path: string, init?: globalThis.RequestInit): Promise<globalThis.Response>;
  send(path: string, method: string, body: object | null): Promise<globalThis.Response>;
  createHeaders?(path: string, method: string, body: object | null): globalThis.HeadersInit;
}
