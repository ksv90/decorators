import { HIGH_PRIORITY, LOW_PRIORITY, MEDIUM_PRIORITY } from './constants';

export type ListenerPriority = typeof LOW_PRIORITY | typeof MEDIUM_PRIORITY | typeof HIGH_PRIORITY;

export interface ListenerEvent<TEventName extends PropertyKey, TData extends unknown[]> {
  eventName: TEventName;
  listener: Listener<TEventName, TData>;
  priority: ListenerPriority;
}

export type Listener<TEventName extends PropertyKey, TData extends unknown[]> = (...eventData: [...TData, ListenerEvent<TEventName, TData>]) => void;

export type Condition<TData extends unknown[]> = (...data: TData) => boolean;

export type EventMap<TEvents> = Record<keyof TEvents, unknown[]>;

export interface ListenerOptions<TData extends unknown[]> {
  readonly once?: boolean;
  readonly priority?: ListenerPriority;
  readonly cond?: Condition<TData>;
}

export interface IEmitter<TEvents extends EventMap<TEvents>> {
  addListener<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName]>,
    options?: ListenerOptions<TEvents[TEventName]>,
  ): this;
  removeListener<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEventName, TEvents[TEventName]>): this;
  hasListener<TEventName extends keyof TEvents>(name: TEventName, listener: Listener<TEventName, TEvents[TEventName]>): boolean;
  emit<TEventName extends keyof TEvents>(eventName: TEventName, ...args: TEvents[TEventName]): boolean;
  removeAllListeners(eventName?: keyof TEvents): this;
  getListenersByName<TEventName extends keyof TEvents>(eventName: TEventName): Array<Listener<TEventName, TEvents[TEventName]>>;
  getEventNames<TEventName extends keyof TEvents>(): TEventName[];
  on<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName]>,
    options?: Omit<ListenerOptions<TEvents[TEventName]>, 'once'>,
  ): this;
  once<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName]>,
    options?: Omit<ListenerOptions<TEvents[TEventName]>, 'once'>,
  ): this;
  off<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEventName, TEvents[TEventName]>): this;
}
