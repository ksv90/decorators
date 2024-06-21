import { ClassDecorator, Constructor } from '../types';
import { IEmitter, Listener, ListenerOptions } from './types';

export const Emitter = <TEvents extends object, TConstructor extends Constructor>(): ClassDecorator<
  TConstructor,
  TConstructor & Constructor<IEmitter<TEvents>>
> => {
  return (Target) => {
    abstract class EmitterMixin extends Target implements IEmitter<TEvents> {
      readonly #listenerMap = new Map<keyof TEvents, Map<Listener, ListenerOptions | undefined>>();

      on<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>, options?: ListenerOptions): void {
        let listeners = this.#listenerMap.get(name);
        if (!listeners) {
          listeners = new Map<Listener, ListenerOptions>();
          this.#listenerMap.set(name, listeners);
        }
        listeners.set(listener, options);
      }

      once<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>, options?: Omit<ListenerOptions, 'once'>): void {
        this.on(name, listener, { ...options, once: true });
      }

      off<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>): void {
        const listeners = this.#listenerMap.get(name);
        listeners?.delete(listener);
      }

      hasListener<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>): boolean {
        const listeners = this.#listenerMap.get(name);
        return !!listeners && listeners.has(listener);
      }

      emit<TName extends keyof TEvents>(name: TName, data: TEvents[TName]): void {
        const listeners = this.#listenerMap.get(name);
        listeners?.forEach((options, listener, map) => {
          if (options?.once) map.delete(listener);
          listener(data);
        });
      }

      removeListenersByName<TName extends keyof TEvents>(name: TName): void {
        this.#listenerMap.delete(name);
      }

      clearAll(): void {
        this.#listenerMap.clear();
      }
    }

    return EmitterMixin;
  };
};
