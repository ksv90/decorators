import { HIGH_PRIORITY, LOW_PRIORITY, MEDIUM_PRIORITY } from './constants';

export type Priority = typeof LOW_PRIORITY | typeof MEDIUM_PRIORITY | typeof HIGH_PRIORITY;

export type Listener<TEventName extends PropertyKey, TData extends unknown[], TContext extends object | undefined = undefined> = (
  this: Info<TEventName, TData, TContext>,
  ...eventData: TData
) => void;

export type Condition<TData extends unknown[]> = (...eventData: TData) => boolean;

export type EventMap<TEvents> = Record<keyof TEvents, unknown[]>;

export interface Info<TEventName extends PropertyKey, TData extends unknown[], TContext extends object | undefined = undefined> {
  readonly eventName: TEventName;
  readonly listener: Listener<TEventName, TData, TContext>;
  readonly priority: Priority;
  readonly context: NoInfer<TContext>;
}

export interface Options<TData extends unknown[], TContext extends object | undefined = undefined> {
  readonly once?: boolean;
  readonly priority?: Priority;
  readonly cond?: Condition<TData>;
  readonly context?: TContext extends undefined ? never : TContext;
}

export interface IEmitter<TEvents extends EventMap<TEvents>> {
  addListener<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Options<TEvents[TEventName], TContext>,
  ): void;
  removeListener<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): void;
  hasListener<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    name: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): boolean;
  emit<TEventName extends keyof TEvents>(eventName: TEventName, ...args: TEvents[TEventName]): boolean;
  removeAllListeners(eventName?: keyof TEvents): void;
  getListenersByName<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
  ): Iterable<Listener<TEventName, TEvents[TEventName], TContext>>;
  getEventNames<TEventName extends keyof TEvents>(): Iterable<TEventName>;
  on<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Omit<Options<TEvents[TEventName], TContext>, 'once'>,
  ): this;
  once<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Omit<Options<TEvents[TEventName], TContext>, 'once'>,
  ): this;
  off<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): this;
}

export interface IEmitterLite<TEvents extends EventMap<TEvents>> {
  hasListener<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    name: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): boolean;
  getListenersByName<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
  ): Iterable<Listener<TEventName, TEvents[TEventName], TContext>>;
  getEventNames<TEventName extends keyof TEvents>(): Iterable<TEventName>;
  on<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Omit<Options<TEvents[TEventName], TContext>, 'once'>,
  ): this;
  once<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
    options?: Omit<Options<TEvents[TEventName], TContext>, 'once'>,
  ): this;
  off<TEventName extends keyof TEvents, TContext extends object | undefined = undefined>(
    eventName: TEventName,
    listener: Listener<TEventName, TEvents[TEventName], TContext>,
  ): this;
}
