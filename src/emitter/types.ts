// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Listener<TEventData = any> = (data: TEventData) => void;

export interface ListenerOptions {
  readonly once?: boolean;
}

export interface IEmitter<TEvents extends object> {
  on<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>, options?: ListenerOptions): void;

  once<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>, options?: Omit<ListenerOptions, 'once'>): void;

  off<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>): void;

  hasListener<TName extends keyof TEvents>(name: TName, listener: Listener<TEvents[TName]>): boolean;

  /** @protected */
  emit<TName extends keyof TEvents, TData extends TEvents[TName]>(name: TName, data: TData): void;

  /** @protected */
  removeListenersByName<TName extends keyof TEvents>(name: TName): void;

  /** @protected */
  clearAll(): void;
}
