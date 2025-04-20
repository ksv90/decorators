import { broadcasterMap } from './constants';
import { IBroadcaster, ListenerData, Subscriber } from './types';

export interface BroadcasterData<TEvents extends object> {
  broadcastChannel?: BroadcastChannel;
  subscriberMap: Map<keyof TEvents, Set<Subscriber>>;
  queue: Set<ListenerData<TEvents, keyof TEvents>>;
  listener: (ctx: { data: ListenerData<TEvents, keyof TEvents> }) => void;
}

export function makeListener<TEvents extends object>(target: IBroadcaster<TEvents>) {
  return function listener(ctx: { data: ListenerData<TEvents, keyof TEvents> }) {
    const { eventName, eventData } = ctx.data;
    const { subscriberMap } = getBroadcasterDataByTarget<TEvents>(target);
    const subscribers = subscriberMap.get(eventName);
    if (!subscribers) return;
    for (const subscriber of subscribers) {
      subscriber(eventData);
    }
  };
}

export function getBroadcasterDataByTarget<TEvents extends object>(target: IBroadcaster<TEvents>) {
  let broadcasterData = broadcasterMap.get(target) as BroadcasterData<TEvents> | undefined;
  if (!broadcasterData) {
    broadcasterData = {
      subscriberMap: new Map(),
      listener: makeListener(target),
      queue: new Set(),
    };
    broadcasterMap.set(target, broadcasterData);
  }
  return broadcasterData;
}

export function subscribe<TEvents extends object, TEventName extends keyof TEvents>(
  this: IBroadcaster<TEvents>,
  eventName: TEventName,
  subscriber: Subscriber<TEvents[TEventName]>,
): void {
  const { subscriberMap } = getBroadcasterDataByTarget<TEvents>(this);
  let subscribers = subscriberMap.get(eventName);
  if (!subscribers) {
    subscribers = new Set<Subscriber>();
    subscriberMap.set(eventName, subscribers);
  }
  subscribers.add(subscriber);
}

export function unsubscribe<TEvents extends object, TEventName extends keyof TEvents>(
  this: IBroadcaster<TEvents>,
  eventName: TEventName,
  subscriber: Subscriber<TEvents[TEventName]>,
): void {
  const { subscriberMap } = getBroadcasterDataByTarget<TEvents>(this);
  const subscribers = subscriberMap.get(eventName);
  if (!subscribers) return;
  subscribers.delete(subscriber);
  if (!subscribers.size) subscriberMap.delete(eventName);
}

export function publish<TEvents extends object, TEventName extends keyof TEvents>(
  this: IBroadcaster<TEvents>,
  eventName: TEventName,
  eventData: TEvents[TEventName],
): void {
  const listenerData = { eventName, eventData } satisfies ListenerData<TEvents, TEventName>;
  const { broadcastChannel, queue, listener } = getBroadcasterDataByTarget<TEvents>(this);
  if (broadcastChannel) {
    broadcastChannel.postMessage(listenerData);
    listener({ data: listenerData });
  } else {
    queue.add(listenerData);
  }
}

export function closeBroadcastChannel<TEvents extends object>(this: IBroadcaster<TEvents>): void {
  const { subscriberMap, queue, listener, broadcastChannel } = getBroadcasterDataByTarget<TEvents>(this);
  queue.clear();
  subscriberMap.clear();
  if (broadcastChannel) {
    broadcastChannel.removeEventListener('message', listener);
    broadcastChannel.close();
  }
}
