import { ClassDecorator, Constructor } from '../types';
import { closeBroadcastChannel, getBroadcasterDataByTarget, publish, subscribe, unsubscribe } from './methods';
import { IBroadcaster } from './types';

export const Broadcaster = <TEvents extends object, TConstructor extends Constructor>(
  name: string,
): ClassDecorator<TConstructor, TConstructor & Constructor<IBroadcaster<TEvents>>> => {
  return (Target) => {
    interface BroadcasterMixin extends IBroadcaster<TEvents> {}
    abstract class BroadcasterMixin extends Target implements IBroadcaster<TEvents> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);

        const broadcastChannel = new BroadcastChannel(name);
        const broadcasterData = getBroadcasterDataByTarget(this);

        broadcasterData.broadcastChannel = broadcastChannel;

        broadcastChannel.addEventListener('message', broadcasterData.listener);

        for (const data of broadcasterData.queue) {
          broadcastChannel.postMessage(data);
          broadcasterData.listener({ data });
        }

        broadcasterData.queue.clear();
      }
    }

    const broadcasterPrototype = BroadcasterMixin.prototype as BroadcasterMixin;
    broadcasterPrototype.subscribe = subscribe;
    broadcasterPrototype.unsubscribe = unsubscribe;
    broadcasterPrototype.publish = publish;
    broadcasterPrototype.closeBroadcastChannel = closeBroadcastChannel;

    Object.defineProperty(BroadcasterMixin, 'name', { value: Target.name });

    return BroadcasterMixin;
  };
};
