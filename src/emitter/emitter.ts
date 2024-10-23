import { ClassDecorator, Constructor } from '../types';
import {
  addListener,
  emit,
  emitterMap,
  getEventNames,
  getListenersByName,
  hasListener,
  off,
  on,
  once,
  removeAllListeners,
  removeListener,
} from './methods';
import { EventMap, IEmitter, ListenerMap, ListenerPriority } from './types';

export const Emitter = <TEvents extends EventMap<TEvents>, TConstructor extends Constructor>(): ClassDecorator<
  TConstructor,
  TConstructor & Constructor<IEmitter<TEvents>>
> => {
  return (Target) => {
    interface EmitterMixin extends IEmitter<TEvents> {}
    abstract class EmitterMixin extends Target {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);
        if (!emitterMap.has(this)) {
          emitterMap.set(this, new Map<ListenerPriority, Map<keyof TEvents, ListenerMap>>());
        }
      }
    }

    const emitterPrototype = EmitterMixin.prototype as EmitterMixin;
    emitterPrototype.addListener = addListener;
    emitterPrototype.removeListener = removeListener;
    emitterPrototype.emit = emit;
    emitterPrototype.hasListener = hasListener;
    emitterPrototype.removeAllListeners = removeAllListeners;
    emitterPrototype.getListenersByName = getListenersByName;
    emitterPrototype.getEventNames = getEventNames;
    emitterPrototype.on = on;
    emitterPrototype.once = once;
    emitterPrototype.off = off;

    Object.defineProperty(EmitterMixin, 'name', { value: Target.name });

    return EmitterMixin;
  };
};
