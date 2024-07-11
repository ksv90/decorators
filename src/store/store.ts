import { ClassDecorator, Constructor } from '../types';
import { IStore, StoreOptions } from './types';

/**
 * Включена дополнительная проверка #store in this
 * TypeError: Cannot read from private field
 * Такая ошибка возникает, когда конструктор класса пытается записать данные, а хранилище еще не создано
 */

export const Store = <TStore extends object, TConstructor extends Constructor>(
  store: Readonly<TStore> = {} as TStore,
  options?: StoreOptions,
): ClassDecorator<TConstructor, TConstructor & Constructor<IStore<TStore>>> => {
  return (Target) => {
    abstract class StoreMixin extends Target implements IStore<TStore> {
      #store = { ...store };

      get<TKey extends keyof TStore>(key: TKey): TStore[TKey] {
        const s = #store in this ? this.#store : store;
        if (this.has(key)) return s[key];
        throw new Error(`the store does not contain data by key ${String(key)}`);
      }

      set<TKey extends keyof TStore>(key: TKey, value: TStore[TKey], force?: boolean): void {
        let s: TStore;
        if (#store in this) {
          s = this.#store;
        } else {
          s = { ...store };
          store = s;
        }
        if (this.has(key) && !(force ?? options?.force ?? true)) {
          throw new Error(`the store already contains data for the key ${String(key)}`);
        }
        s[key] = value;
      }

      has<TKey extends keyof TStore>(key: PropertyKey): key is TKey {
        const s = #store in this ? this.#store : store;
        return key in s;
      }

      remove<TKey extends keyof TStore>(key: TKey): void {
        delete this.#store[key];
      }
    }

    return StoreMixin;
  };
};
