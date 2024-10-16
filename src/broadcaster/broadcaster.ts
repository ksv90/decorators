import { ClassDecorator, Constructor } from '../types';
import { IBroadcaster, Subscriber } from './types';

export const Broadcaster = <TEvents extends object, TConstructor extends Constructor>(
  name: string,
): ClassDecorator<TConstructor, TConstructor & Constructor<IBroadcaster<TEvents>>> => {
  return (Target) => {
    abstract class BroadcasterMixin extends Target implements IBroadcaster<TEvents> {
      readonly #subscriberMap = new Map<keyof TEvents, Set<Subscriber>>();

      readonly #broadcastChannel = new BroadcastChannel(name);

      readonly #listener = (ctx: { data: { event: keyof TEvents; data: unknown } }) => {
        const { event, data } = ctx.data;
        const subscribers = this.#subscriberMap.get(event);
        subscribers?.forEach((subscriber) => {
          subscriber(data);
        });
      };

      // open issue https://github.com/microsoft/TypeScript/issues/37142
      // constructor(...args: ConstructorParameters<TConstructor>)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);

        this.#broadcastChannel.addEventListener('message', this.#listener);
      }

      subscribe<TEvent extends keyof TEvents>(event: TEvent, subscriber: Subscriber<TEvents[TEvent]>): void {
        let subscribers = this.#subscriberMap.get(event);
        if (!subscribers) {
          subscribers = new Set<Subscriber>();
          this.#subscriberMap.set(event, subscribers);
        }
        subscribers.add(subscriber);
      }

      unsubscribe<TEvent extends keyof TEvents>(event: TEvent, subscriber: Subscriber<TEvents[TEvent]>): void {
        const listeners = this.#subscriberMap.get(event);
        listeners?.delete(subscriber);
      }

      publish<TEvent extends keyof TEvents, TData extends TEvents[TEvent]>(event: TEvent, data: TData): void {
        this.#broadcastChannel.postMessage({ event, data });
        this.#listener({ data: { event, data } });
      }

      closeBroadcastChannel(): void {
        this.#subscriberMap.clear();
        this.#broadcastChannel.removeEventListener('message', this.#listener);
        this.#broadcastChannel.close();
      }
    }

    return BroadcasterMixin;
  };
};
