export type Listener<TArgs extends unknown[]> = (...args: TArgs) => void;

export type Condition<TArgs extends unknown[]> = (...args: TArgs) => boolean;

export type ListenerPriority = 'low' | 'medium' | 'high';

export type EventMap<TEvents> = Record<keyof TEvents, unknown[]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListenerMap = Map<Listener<any>, IListenerOptions<any> | undefined>;

export interface IListenerOptions<TArgs extends unknown[]> {
  readonly once?: boolean;
  readonly priority?: ListenerPriority;
  readonly cond?: Condition<TArgs>;
}

export interface IEmitter<TEvents extends EventMap<TEvents>> {
  addListener<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEvents[TEventName]>,
    options?: IListenerOptions<TEvents[TEventName]>,
  ): this;
  removeListener<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>): this;
  hasListener<TEventName extends keyof TEvents>(name: TEventName, listener: Listener<TEvents[TEventName]>): boolean;
  emit<TEventName extends keyof TEvents>(eventName: TEventName, ...args: TEvents[TEventName]): boolean;
  removeAllListeners<TEventName extends keyof TEvents>(eventName?: TEventName): this;
  getListenersByName<TEventName extends keyof TEvents>(eventName: TEventName): Array<Listener<TEvents[TEventName]>>;
  getEventNames(): Array<keyof TEvents>;
  on<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEvents[TEventName]>,
    options?: Omit<IListenerOptions<TEvents[TEventName]>, 'once'>,
  ): this;
  once<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: Listener<TEvents[TEventName]>,
    options?: Omit<IListenerOptions<TEvents[TEventName]>, 'once'>,
  ): this;
  off<TEventName extends keyof TEvents>(eventName: TEventName, listener: Listener<TEvents[TEventName]>): this;
}
