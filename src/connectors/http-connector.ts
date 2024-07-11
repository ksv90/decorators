import { ClassDecorator, Constructor } from '../types';
import { HttpConnectorOptions, IHttpConnector } from './types';
import { getMessageError } from './utils';

export const HttpConnector = <TConstructor extends Constructor>(
  options?: HttpConnectorOptions,
): ClassDecorator<TConstructor, TConstructor & Constructor<IHttpConnector>> => {
  return (Target) => {
    abstract class HttpConnectorMixin extends Target implements IHttpConnector {
      public url = options?.url ?? '';

      async request(input: string, init?: globalThis.RequestInit): Promise<globalThis.Response> {
        if (!globalThis.navigator.onLine) {
          throw new Error('connection lost');
        }
        let inputNormalize;
        if (!this.url) inputNormalize = input;
        else if (input.startsWith('/')) inputNormalize = input;
        else inputNormalize = `/${input}`;
        const response = await globalThis.fetch(`${this.url}${inputNormalize}`, init);
        return response;
      }

      async send(input: string, method: string, body: object | null): Promise<globalThis.Response> {
        const response = await this.request(input, {
          method,
          body: body && JSON.stringify(body),
          headers: this.createHeaders?.(input, method, body),
        });
        if (response.ok) return response;
        const errorData = (await response.json()) as unknown;
        const message = getMessageError(errorData);
        throw new Error(message);
      }

      createHeaders?(input: string, method: string, body: object | null): globalThis.HeadersInit;
    }

    return HttpConnectorMixin;
  };
};
