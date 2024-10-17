import { describe, expect, it } from 'vitest';

import { Storer } from '../storer';
import { IStorer } from '../types';

interface Store {
  balance: number;
  currency: string;
  nested?: { value: number };
}

describe('storer advanced', () => {
  it('должен быть инициирован с данными', () => {
    const [balance, currency] = [42, 'EUR'];
    interface Storage extends IStorer<Store> {}
    @Storer({ balance, currency } satisfies Store)
    class Storage {}
    const storage = new Storage();
    const savedBalance = storage.get('balance');
    const savedCurrency = storage.get('currency');
    expect(savedBalance).toBe(balance);
    expect(savedCurrency).toBe(currency);
    expect(typeof savedBalance).toBe('number');
    expect(typeof savedCurrency).toBe('string');
  });

  it('должен возвращать сохраненные данные', () => {
    interface Storage extends IStorer<Store> {}
    @Storer()
    class Storage {}
    const [balance, currency] = [42, 'EUR'];
    const storage = new Storage();
    storage.set('balance', balance);
    storage.set('currency', currency);
    const savedBalance = storage.get('balance');
    const savedCurrency = storage.get('currency');
    expect(savedBalance).toBe(balance);
    expect(savedCurrency).toBe(currency);
    expect(typeof savedBalance).toBe('number');
    expect(typeof savedCurrency).toBe('string');
  });

  it('должен удалять только запрошенные данные', () => {
    const [balance, currency] = [42, 'EUR'];
    interface Storage extends IStorer<Store> {}
    @Storer({ balance, currency } satisfies Store)
    class Storage {}
    const storage = new Storage();
    expect(storage.has('balance')).toBeTruthy();
    expect(storage.has('currency')).toBeTruthy();
    storage.remove('balance');
    expect(storage.has('balance')).toBeFalsy();
    expect(storage.has('currency')).toBeTruthy();
    expect(typeof storage.get('currency')).toBe('string');
  });

  it('должен иметь уникальное хранилище', () => {
    const [balance, currency] = [42, 'EUR'];
    const store = { balance, currency } satisfies Store;
    interface Storage1 extends IStorer<Store> {}
    @Storer(store)
    class Storage1 {}
    const storage1 = new Storage1();
    interface Storage2 extends IStorer<Store> {}
    @Storer(store)
    class Storage2 {}
    const storage2 = new Storage2();
    expect(storage1.get('balance')).toBe(balance);
    expect(storage2.get('balance')).toBe(balance);
    expect(store.balance).toBe(balance);
    store.balance += 1;
    expect(storage1.get('balance')).toBe(balance);
    expect(storage2.get('balance')).toBe(balance);
    expect(store.balance).toBe(balance + 1);
    storage1.set('balance', balance + 1);
    expect(storage1.get('balance')).toBe(balance + 1);
    expect(storage2.get('balance')).toBe(balance);
    expect(store.balance).toBe(balance + 1);
  });

  it('должен делать глубокую копию хранилища', () => {
    const value = 1;
    const [balance, currency, nested] = [42, 'EUR', { value }];
    const store = { balance, currency, nested } satisfies Store;
    interface Storage1 extends IStorer<Store> {}
    @Storer(store)
    class Storage1 {}
    const storage1 = new Storage1();
    interface Storage2 extends IStorer<Store> {}
    @Storer(store)
    class Storage2 {}
    const storage2 = new Storage2();
    expect(storage1.get('nested')?.value).toBe(value);
    expect(storage2.get('nested')?.value).toBe(value);
    expect(store.nested.value).toBe(value);
    store.nested.value += 1;
    expect(storage1.get('nested')?.value).toBe(value);
    expect(storage2.get('nested')?.value).toBe(value);
    expect(store.nested.value).toBe(value + 1);
    const savedNested = storage1.get('nested');
    expect(savedNested).not.undefined;
    savedNested!.value += 1;
    expect(storage1.get('nested')?.value).toBe(value + 1);
    expect(storage2.get('nested')?.value).toBe(value);
    expect(store.nested.value).toBe(value + 1);
  });

  it('должен иметь возможность сохранять данные в конструкторе', () => {
    const balance = 42;
    interface Storage extends IStorer<Store> {}
    @Storer()
    class Storage {
      constructor() {
        this.set('balance', balance);
      }
    }
    const storage = new Storage();
    expect(storage.get('balance')).toBe(balance);
  });

  it('должен перезаписывать данные в конструкторе', () => {
    const [balance, currency] = [42, 'EUR'];
    interface Storage extends IStorer<Store> {}
    @Storer({ balance, currency } satisfies Store)
    class Storage {
      constructor() {
        this.set('balance', balance + 1);
      }
    }
    const storage = new Storage();
    expect(storage.get('balance')).toBe(balance + 1);
    expect(storage.get('currency')).toBe(currency);
  });
});
