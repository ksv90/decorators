import { EventMap, IEmitter, IListenerOptions, Listener, ListenerMap, ListenerPriority } from './types';

export const emitterMap = new WeakMap<object, unknown>();

function getCurrentEmitterMap<TEvents extends EventMap<TEvents>>(target: IEmitter<TEvents>): Map<ListenerPriority, Map<keyof TEvents, ListenerMap>> {
  let listenerPriorityMap = emitterMap.get(target) as Map<ListenerPriority, Map<keyof TEvents, ListenerMap>> | undefined;
  if (!listenerPriorityMap) {
    listenerPriorityMap = new Map();
    emitterMap.set(target, listenerPriorityMap);
  }
  return listenerPriorityMap;
}

export function addListener<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEvents[TEventName]>,
  options?: IListenerOptions,
): TEmitter {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  const priority = options?.priority ?? 'medium';
  if (!listenerPriorityMap.has(priority)) listenerPriorityMap.set(priority, new Map());
  listenerPriorityMap.forEach((listenerMap, listenerPriority) => {
    let listeners = listenerMap.get(eventName);
    if (listenerPriority !== priority) {
      if (listeners) {
        listeners.delete(listener);
        if (!listeners.size) listenerMap.delete(eventName);
        if (!listenerMap.size) listenerPriorityMap.delete(listenerPriority);
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

export function removeListener<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEvents[TEventName]>,
): TEmitter {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  listenerPriorityMap.forEach((listenerMap, listenerPriority, map) => {
    const listeners = listenerMap.get(eventName);
    if (!listeners) return;
    listeners.delete(listener);
    if (!listeners.size) listenerMap.delete(eventName);
    if (!listenerMap.size) map.delete(listenerPriority);
  });
  return this;
}

export function emit<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  ...args: TEvents[TEventName]
): boolean {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  let hasListener = false;
  Array.from(listenerPriorityMap)
    .sort(([a], [b]) => (b === 'low' || a === 'high' ? 1 : -1))
    .forEach(([priority, listenerPriority]) => {
      listenerPriority.forEach((listenerMap, listenerEventName) => {
        if (listenerEventName !== eventName) return;
        listenerMap.forEach((options, listener) => {
          hasListener = true;
          if (options?.once) {
            listenerMap.delete(listener);
            if (!listenerMap.size) listenerPriority.delete(listenerEventName);
            if (!listenerPriority.size) listenerPriorityMap.delete(priority);
          }
          listener(...args);
        });
      });
    });
  return hasListener;
}

export function hasListener<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEvents[TEventName]>,
): boolean {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  for (const listenerMap of listenerPriorityMap.values()) {
    const listeners = listenerMap.get(eventName);
    if (listeners?.has(listener)) return true;
  }
  return false;
}

export function removeAllListeners<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName?: TEventName,
): TEmitter {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  if (eventName) {
    listenerPriorityMap.forEach((listenerMap, listenerPriority) => {
      listenerMap.delete(eventName);
      if (!listenerMap.size) listenerPriorityMap.delete(listenerPriority);
    });
  } else {
    listenerPriorityMap.clear();
  }
  return this;
}

export function getListenersByName<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
): Array<Listener<TEvents[TEventName]>> {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  for (const listenerMap of listenerPriorityMap.values()) {
    const listeners = listenerMap.get(eventName);
    if (listeners) return Array.from(listeners.keys());
  }
  return [];
}

export function getEventNames<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>>(this: TEmitter): Array<keyof TEvents> {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  const eventNames = new Set<keyof TEvents>();
  listenerPriorityMap.forEach((listenerMap) => {
    listenerMap.forEach((_, listenerEventName) => {
      eventNames.add(listenerEventName);
    });
  });
  return Array.from(eventNames);
}

export function on<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEvents[TEventName]>,
  options?: Omit<IListenerOptions, 'once'>,
): TEmitter {
  return this.addListener(eventName, listener, { ...options, once: false });
}

export function once<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEvents[TEventName]>,
  options?: Omit<IListenerOptions, 'once'>,
): TEmitter {
  return this.addListener(eventName, listener, { ...options, once: true });
}

export function off<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEvents[TEventName]>,
): TEmitter {
  return this.removeListener(eventName, listener);
}
