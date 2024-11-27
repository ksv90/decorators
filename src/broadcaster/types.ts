// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Subscriber<TEventData = any> = (data: TEventData) => void;

export interface IBroadcaster<TEvents extends object> {
  subscribe<TEvent extends keyof TEvents>(event: TEvent, subscriber: Subscriber<TEvents[TEvent]>): void;

  unsubscribe<TEvent extends keyof TEvents>(event: TEvent, subscriber: Subscriber<TEvents[TEvent]>): void;

  /** @protected */
  publish<TEvent extends keyof TEvents>(event: TEvent, data: TEvents[TEvent]): void;
}
