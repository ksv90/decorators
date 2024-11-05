import { emitterMap, HIGH_PRIORITY, LOW_PRIORITY, MEDIUM_PRIORITY } from './constants';
import { EventMap, IEmitter, IListenerOptions, Listener, ListenerPriority } from './types';

type ListenerMap<TEventName extends PropertyKey, TData extends unknown[]> = Map<Listener<TEventName, TData>, IListenerOptions<TData> | undefined>;

type EventNameMap<TEventName extends PropertyKey, TData extends unknown[]> = Map<TEventName, ListenerMap<TEventName, TData>>;

type PriorityMap<TEventName extends PropertyKey, TData extends unknown[]> = Map<ListenerPriority, EventNameMap<TEventName, TData>>;

function getCurrentEmitterMap<TEvents extends EventMap<TEvents>>(target: IEmitter<TEvents>): PriorityMap<keyof TEvents, TEvents[keyof TEvents]> {
  let listenerPriorityMap = emitterMap.get(target) as PriorityMap<keyof TEvents, TEvents[keyof TEvents]> | undefined;
  if (!listenerPriorityMap) {
    listenerPriorityMap = new Map();
    emitterMap.set(target, listenerPriorityMap);
  }
  return listenerPriorityMap;
}

export function addListener<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName]>,
  options?: IListenerOptions<TEvents[TEventName]>,
): TEmitter {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  const priority = options?.priority ?? MEDIUM_PRIORITY;
  if (!listenerPriorityMap.has(priority)) listenerPriorityMap.set(priority, new Map());
  listenerPriorityMap.forEach((listenerMap, listenerPriority) => {
    let listeners = listenerMap.get(eventName) as ListenerMap<TEventName, TEvents[TEventName]> | undefined;
    if (listenerPriority !== priority) {
      if (listeners) {
        listeners.delete(listener);
        if (!listeners.size) listenerMap.delete(eventName);
        if (!listenerMap.size) listenerPriorityMap.delete(listenerPriority);
      }
    } else {
      if (!listeners) {
        listeners = new Map();
        listenerMap.set(eventName, listeners as ListenerMap<keyof TEvents, TEvents[keyof TEvents]>);
      }
      listeners.set(listener, options);
    }
  });
  return this;
}

export function removeListener<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName]>,
): TEmitter {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  listenerPriorityMap.forEach((listenerMap, listenerPriority, map) => {
    const listeners = listenerMap.get(eventName) as ListenerMap<TEventName, TEvents[TEventName]> | undefined;
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
  ...data: TEvents[TEventName]
): boolean {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  let hasListener = false;
  Array.from(listenerPriorityMap)
    .sort(([a], [b]) => (a === LOW_PRIORITY || b === HIGH_PRIORITY ? 1 : -1))
    .forEach(([priority, listenerPriority]) => {
      listenerPriority.forEach((listenerMap, listenerEventName) => {
        if (listenerEventName !== eventName) return;
        listenerMap.forEach((options, listener) => {
          if (!(options?.cond?.(...data) ?? true)) return;
          hasListener = true;
          if (options?.once) {
            listenerMap.delete(listener);
            if (!listenerMap.size) listenerPriority.delete(listenerEventName);
            if (!listenerPriority.size) listenerPriorityMap.delete(priority);
          }
          listener(...data, { eventName, listener, priority });
        });
      });
    });
  return hasListener;
}

export function hasListener<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName]>,
): boolean {
  const listenerPriorityMap = getCurrentEmitterMap(this);
  for (const listenerMap of listenerPriorityMap.values()) {
    const listeners = listenerMap.get(eventName) as ListenerMap<TEventName, TEvents[TEventName]> | undefined;
    if (listeners?.has(listener)) return true;
  }
  return false;
}

export function removeAllListeners<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>>(
  this: TEmitter,
  eventName?: keyof TEvents,
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
): Array<Listener<TEventName, TEvents[TEventName]>> {
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
  listener: Listener<TEventName, TEvents[TEventName]>,
  options?: Omit<IListenerOptions<TEvents[TEventName]>, 'once'>,
): TEmitter {
  return this.addListener(eventName, listener, { ...options, once: false });
}

export function once<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName]>,
  options?: Omit<IListenerOptions<TEvents[TEventName]>, 'once'>,
): TEmitter {
  return this.addListener(eventName, listener, { ...options, once: true });
}

export function off<TEvents extends EventMap<TEvents>, TEmitter extends IEmitter<TEvents>, TEventName extends keyof TEvents>(
  this: TEmitter,
  eventName: TEventName,
  listener: Listener<TEventName, TEvents[TEventName]>,
): TEmitter {
  return this.removeListener(eventName, listener);
}
