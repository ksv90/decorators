import { ClassDecorator, Constructor } from '../types';
import { EventMap, IEmitter, IListenerOptions, Listener, ListenerMap, ListenerPriority } from './types';

//

export const Emitter = <TEvents extends EventMap<TEvents>, TConstructor extends Constructor>(): ClassDecorator<
  TConstructor,
  TConstructor & Constructor<IEmitter<TEvents>>
> => {
  return (Target) => {
    abstract class EmitterMixin extends Target implements IEmitter<TEvents> {
      readonly #listenerPriorityMap = new Map<ListenerPriority, Map<keyof TEvents, ListenerMap>>();

      addListener<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<TEvents[TEventName]>,
        options?: IListenerOptions,
      ): this {
        const priority = options?.priority ?? 'medium';
        if (!this.#listenerPriorityMap.has(priority)) this.#listenerPriorityMap.set(priority, new Map());
        this.#listenerPriorityMap.forEach((listenerMap, listenerPriority) => {
          let listeners = listenerMap.get(eventName);
          if (listenerPriority !== priority) {
            if (listeners) {
              listeners.delete(listener);
              if (!listeners.size) listenerMap.delete(eventName);
              if (!listenerMap.size) this.#listenerPriorityMap.delete(listenerPriority);
            }
          } else {
            if (!listeners) {
              listeners = new Map<Listener<TEvents[TEventName]>, IListenerOptions>();
              listenerMap.set(eventName, listeners);
            }
            listeners.set(listener, options);
          }
        });
        return this;
      }

      removeListener<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>): this {
        this.#listenerPriorityMap.forEach((listenerMap, listenerPriority, map) => {
          const listeners = listenerMap.get(eventName);
          if (!listeners) return;
          listeners.delete(listener);
          if (!listeners.size) listenerMap.delete(eventName);
          if (!listenerMap.size) map.delete(listenerPriority);
        });
        return this;
      }

      hasListener<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>): boolean {
        for (const listenerMap of this.#listenerPriorityMap.values()) {
          const listeners = listenerMap.get(eventName);
          if (listeners?.has(listener)) return true;
        }
        return false;
      }

      emit<TEventName extends keyof TEvents>(eventName: TEventName, ...args: TEvents[TEventName]): boolean {
        let hasListener = false;
        Array.from(this.#listenerPriorityMap)
          .sort(([a], [b]) => (b === 'low' || a === 'high' ? 1 : -1))
          .forEach(([priority, listenerPriority]) => {
            listenerPriority.forEach((listenerMap, listenerEventName) => {
              if (listenerEventName !== eventName) return;
              listenerMap.forEach((options, listener) => {
                hasListener = true;
                if (options?.once) {
                  listenerMap.delete(listener);
                  if (!listenerMap.size) listenerPriority.delete(listenerEventName);
                  if (!listenerPriority.size) this.#listenerPriorityMap.delete(priority);
                }
                listener(...args);
              });
            });
          });
        return hasListener;
      }

      removeAllListeners(eventName?: keyof TEvents): this {
        if (eventName) {
          this.#listenerPriorityMap.forEach((listenerMap, listenerPriority) => {
            listenerMap.delete(eventName);
            if (!listenerMap.size) this.#listenerPriorityMap.delete(listenerPriority);
          });
        } else {
          this.#listenerPriorityMap.clear();
        }
        return this;
      }

      getListenersByName<TEventName extends keyof TEvents>(eventName: TEventName): Array<Listener<TEvents[TEventName]>> {
        for (const listenerMap of this.#listenerPriorityMap.values()) {
          const listeners = listenerMap.get(eventName);
          if (listeners) return Array.from(listeners.keys());
        }
        return [];
      }

      getEventNames(): Array<keyof TEvents> {
        const eventNames = new Set<keyof TEvents>();
        this.#listenerPriorityMap.forEach((listenerMap) => {
          listenerMap.forEach((_, listenerEventName) => {
            eventNames.add(listenerEventName);
          });
        });
        return Array.from(eventNames);
      }

      on<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<TEvents[TEventName]>,
        options?: Omit<IListenerOptions, 'once'>,
      ): this {
        return this.addListener(eventName, listener, { ...options, once: false });
      }

      once<TEventName extends keyof TEvents>(
        eventName: TEventName,
        listener: Listener<TEvents[TEventName]>,
        options?: Omit<IListenerOptions, 'once'>,
      ): this {
        return this.addListener(eventName, listener, { ...options, once: true });
      }

      off<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>): this {
        return this.removeListener(eventName, listener);
      }
    }

    return EmitterMixin;
  };
};
