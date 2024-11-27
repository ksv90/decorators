import { IStorer } from './types';

export const storerMap = new WeakMap<object, Record<PropertyKey, unknown>>();

function getCurrentStorerMap<TStore extends object>(target: IStorer<TStore>): TStore {
  let store = storerMap.get(target);
  if (!store) {
    store = {};
    storerMap.set(target, store);
  }
  return store as TStore;
}

export function get<TStore extends object, TKey extends keyof TStore>(this: IStorer<TStore>, key: TKey): TStore[TKey] {
  const store = getCurrentStorerMap(this);
  if (this.has(key)) return store[key];
  throw new Error(`the store does not contain data by key ${String(key)}`);
}

export function set<TStore extends object, TKey extends keyof TStore>(this: IStorer<TStore>, key: TKey, value: TStore[TKey], force = true): void {
  const store = getCurrentStorerMap(this);
  if (this.has(key) && !force) {
    throw new Error(`the store already contains data for the key ${String(key)}`);
  }
  store[key] = value;
}

export function has<TStore extends object>(this: IStorer<TStore>, key: PropertyKey): key is keyof TStore {
  const store = getCurrentStorerMap(this);
  return key in store;
}

export function remove<TStore extends object>(this: IStorer<TStore>, key: keyof TStore): void {
  const store = getCurrentStorerMap(this);
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- store является простым справочником, побочных эффектов от удаления не будет
  delete store[key];
}
