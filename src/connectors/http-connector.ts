import { BaseIssue, BaseSchema, parse } from 'valibot';

import { ClassDecorator, Constructor } from '../types';
import { HttpConnectorOptions, IHttpConnector } from './types';
import { getMessageError } from './utils';

export const HttpConnector = <TConstructor extends Constructor>(
  options: HttpConnectorOptions,
): ClassDecorator<TConstructor, TConstructor & Constructor<IHttpConnector>> => {
  return (Target) => {
    abstract class HttpConnectorMixin extends Target implements IHttpConnector {
      public url = options.url;

      public token = options.token;

      request(path: string, init?: RequestInit): Promise<Response> {
        const pathNormalize = path.startsWith('/') ? path : `/${path}`;
        return globalThis.fetch(`${this.url}${pathNormalize}`, init);
      }

      send(path: string, method: string, body: object | null): Promise<Response> {
        return this.request(path, {
          method,
          body: body && JSON.stringify(body),
          headers: this.getHeaders(path, method, body),
        });
      }

      async post<TData>(path: string, body: object | null, schema?: BaseSchema<TData, TData, BaseIssue<unknown>>): Promise<TData | void> {
        const response = await this.send(path, 'POST', body);
        const data = (await response.json()) as unknown;
        if (!response.ok) {
          const message = getMessageError(data);
          throw new Error(message);
        }
        if (schema) return parse(schema, data);
      }

      getHeaders(_path: string, _method: string, _body: object | null): HeadersInit {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (this.token) headers.Authorization = `Bearer ${this.token}`;
        return headers;
      }
    }

    return HttpConnectorMixin;
  };
};
