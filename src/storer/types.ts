export interface IStorer<TStore extends object> {
  get<TKey extends keyof TStore>(key: TKey): TStore[TKey];
  set<TKey extends keyof TStore>(key: TKey, value: TStore[TKey], force?: boolean): void;
  has<TKey extends keyof TStore>(key: PropertyKey): key is TKey;
  remove<TKey extends keyof TStore>(key: TKey): void;
}
