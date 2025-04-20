export interface ListenerData<TEvents extends object, TEventName extends keyof TEvents> {
  eventName: TEventName;
  eventData: TEvents[TEventName];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Subscriber<TSubscriberData = any> = (data: TSubscriberData) => void;

export interface IBroadcaster<TEvents extends object> {
  subscribe<TEventName extends keyof TEvents>(eventName: TEventName, subscriber: Subscriber<TEvents[TEventName]>): void;

  unsubscribe<TEventName extends keyof TEvents>(eventName: TEventName, subscriber: Subscriber<TEvents[TEventName]>): void;

  publish<TEventName extends keyof TEvents>(eventName: TEventName, eventData: TEvents[TEventName]): void;

  closeBroadcastChannel(): void;
}
