export interface IStorer<TStore extends object> {
  get<TKey extends keyof TStore>(key: TKey): TStore[TKey];
  set<TKey extends keyof TStore>(key: TKey, value: TStore[TKey], force?: boolean): void;
  has(key: PropertyKey): key is keyof TStore;
  remove(key: keyof TStore): void;
}
