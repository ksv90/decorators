// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Listener<TArgs extends unknown[] = any[]> = (...args: TArgs) => void;

export type ListenerPriority = 'low' | 'medium' | 'high';

export type EventMap<TEvents> = Record<keyof TEvents, unknown[]>;

export type ListenerMap = Map<Listener, IListenerOptions | undefined>;

export interface IListenerOptions {
  readonly once?: boolean;
  readonly priority?: ListenerPriority;
}

export interface IEmitter<TEvents extends EventMap<TEvents>> {
  addListener<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>, options?: IListenerOptions): this;
  removeListener<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>): this;
  hasListener<TEventName extends keyof TEvents>(name: TEventName, listener: Listener<TEvents[TEventName]>): boolean;
  emit<TEventName extends keyof TEvents>(eventName: TEventName, ...args: TEvents[TEventName]): boolean;
  removeAllListeners<TEventName extends keyof TEvents>(eventName?: TEventName): this;
  getListenersByName<TEventName extends keyof TEvents>(eventName: TEventName): Array<Listener<TEvents[TEventName]>>;
  getEventNames(): Array<keyof TEvents>;
  on<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEvents[TEventName]>,
    options?: Omit<IListenerOptions, 'once'>,
  ): this;
  once<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEvents[TEventName]>,
    options?: Omit<IListenerOptions, 'once'>,
  ): this;
  off<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>): this;
}
