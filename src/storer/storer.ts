import { ClassDecorator, Constructor } from '../types';
import { get, has, remove, set, storerMap } from './methods';
import { IStorer } from './types';

export const Storer = <TStore extends object, TConstructor extends Constructor>(
  store: Readonly<TStore> = {} as TStore,
): ClassDecorator<TConstructor, TConstructor & Constructor<IStorer<TStore>>> => {
  return (Target) => {
    interface StorerMixin extends IStorer<TStore> {}
    abstract class StorerMixin extends Target {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(...args: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);
        storerMap.set(this, { ...globalThis.structuredClone(store), ...storerMap.get(this) });
      }
    }

    const storerPrototype = StorerMixin.prototype as StorerMixin;
    storerPrototype.get = get;
    storerPrototype.set = set;
    storerPrototype.has = has;
    storerPrototype.remove = remove;

    return StorerMixin;
  };
};
