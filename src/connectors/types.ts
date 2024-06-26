import { BaseIssue, BaseSchema } from 'valibot';

export interface HttpConnectorOptions {
  url: string;
  token?: string;
}

export interface IHttpConnector {
  get url(): string;
  get token(): string | undefined;
  set token(value: string);
  request(path: string, init?: RequestInit): Promise<Response>;
  send(path: string, method: string, body: object | null): Promise<Response>;
  post(path: string, body: object | null): Promise<void>;
  post<TData>(path: string, body: object | null, schema: BaseSchema<TData, TData, BaseIssue<unknown>>): Promise<TData>;
  getHeaders(path: string, method: string, body: object | null): HeadersInit;
}
