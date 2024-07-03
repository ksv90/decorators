import { BaseIssue, BaseSchema } from 'valibot';

export interface HttpConnectorOptions {
  url?: string;
  token?: string;
}

export interface IHttpConnector {
  get url(): string;
  get token(): string | undefined;
  set token(value: string | undefined);
  request(path: string, init?: globalThis.RequestInit): Promise<globalThis.Response>;
  send(path: string, method: string, body: object | null): Promise<globalThis.Response>;
  post(path: string, body: object | null): Promise<void>;
  post<TData>(path: string, body: object | null, schema: BaseSchema<TData, TData, BaseIssue<unknown>>): Promise<TData>;
  getHeaders(path: string, method: string, body: object | null): globalThis.HeadersInit;
}
