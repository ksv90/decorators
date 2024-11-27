import { beforeEach, describe, expect, it } from 'vitest';

import { Storer } from '../storer';
import { IStorer } from '../types';

interface Store {
  balance: number;
  currency?: string;
}

interface Context {
  storage: IStorer<Store>;
}

describe('storer base', () => {
  beforeEach<Context>((context) => {
    interface Storage extends IStorer<Store> {}
    @Storer()
    class Storage {}
    context.storage = new Storage();
  });

  it<Context>('должен содержать все необходимые методы', ({ storage }) => {
    expect('get' in storage).toBeTruthy();
    expect('set' in storage).toBeTruthy();
    expect('has' in storage).toBeTruthy();
    expect('remove' in storage).toBeTruthy();
  });

  it<Context>('должен сохранять, содержать, возвращать и удалять данные', ({ storage }) => {
    const value = 42;
    expect(storage.has('balance')).toBeFalsy();
    storage.set('balance', value);
    expect(storage.has('balance')).toBeTruthy();
    expect(storage.get('balance')).toBe(value);
    storage.remove('balance');
    expect(storage.has('balance')).toBeFalsy();
  });

  it<Context>('должен выбрасывать ошибку, если нет данных по ключу', ({ storage }) => {
    expect(() => storage.get('balance')).toThrow('the store does not contain data by key balance');
  });

  it<Context>('должен перезаписать данные', ({ storage }) => {
    const [v1, v2, v3] = [1, 2, 3];
    storage.set('balance', v1);
    expect(storage.get('balance')).toBe(v1);
    expect(() => {
      storage.set('balance', v2);
    }).not.throw();
    expect(storage.get('balance')).toBe(v2);
    expect(() => {
      storage.set('balance', v3, true);
    }).not.throw();
    expect(storage.get('balance')).toBe(v3);
  });

  it<Context>('должен выбрасывать ошибку, если была попытка сохранить данные c false флагом для force', ({ storage }) => {
    storage.set('balance', 42);
    expect(() => {
      storage.set('balance', 42, false);
    }).toThrow('the store already contains data for the key balance');
  });

  it<Context>('должен возвращать наличие или отсутствие данных по ключу', ({ storage }) => {
    expect(storage.has('currency')).toBeFalsy();
    storage.set('currency', undefined);
    expect(storage.has('currency')).toBeTruthy();
    storage.remove('currency');
    expect(storage.has('currency')).toBeFalsy();
    expect(storage.has('other')).toBeFalsy();
    expect(storage.has('balance')).toBeFalsy();
    storage.set('balance', 42);
    expect(storage.has('balance')).toBeTruthy();
    storage.remove('balance');
    expect(storage.has('balance')).toBeFalsy();
  });
});
