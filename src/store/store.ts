import { ClassDecorator, Constructor } from '../types';
import { IStore, StoreOptions } from './types';

export const Store = <TStore extends object, TConstructor extends Constructor>(
  store: TStore,
  options?: StoreOptions,
): ClassDecorator<TConstructor, TConstructor & Constructor<IStore<TStore>>> => {
  return (Target) => {
    abstract class StoreMixin extends Target implements IStore<TStore> {
      #store = { ...store };

      get<TKey extends keyof TStore>(key: TKey): TStore[TKey] {
        if (key in this.#store) return this.#store[key];
        throw new Error(`the store does not contain data by key ${String(key)}`);
      }

      set<TKey extends keyof TStore>(key: TKey, value: TStore[TKey], force?: boolean): void {
        if (this.has(key) && !(force ?? options?.force ?? true)) {
          throw new Error(`the store already contains data for the key ${String(key)}`);
        }
        this.#store[key] = value;
      }

      has<TKey extends keyof TStore>(key: PropertyKey): key is TKey {
        return key in this.#store;
      }

      remove<TKey extends keyof TStore>(key: TKey): void {
        delete this.#store[key];
      }
    }

    return StoreMixin;
  };
};
