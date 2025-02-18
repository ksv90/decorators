import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Emitter } from '../emitter';
import { IEmitter } from '../types';

interface TestEmitterEvents {
  eventOne: [string];
  eventTwo: [number];
  eventThree: [{ eventDataOne: string; eventDataTwo: number }];
}

interface TestEmitter extends IEmitter<TestEmitterEvents> {}

interface Context {
  testEmitter: TestEmitter;
}

@Emitter()
class TestEmitter {}

describe('Emitter', () => {
  beforeEach<Context>((ctx) => {
    ctx.testEmitter = new TestEmitter();
  });

  it<Context>('должен быть вызван on метод', ({ testEmitter }) => {
    const spy = vi.spyOn(testEmitter, 'on');
    testEmitter.on('eventOne', () => undefined);
    expect(spy).toHaveBeenCalled();
  });

  it<Context>('должен вызвать событие', ({ testEmitter }) => {
    const testValue = 'test';
    let resultValue = 'other';
    testEmitter.on('eventOne', (data) => {
      resultValue = data;
    });
    testEmitter.emit('eventOne', testValue);
    expect(resultValue).toEqual(testValue);
  });

  it<Context>('должен добавлять и удалять слушатель', ({ testEmitter }) => {
    const listener = () => undefined;
    testEmitter.on('eventOne', listener);
    expect(testEmitter.hasListener('eventOne', listener)).toBe(true);
    testEmitter.off('eventOne', listener);
    expect(testEmitter.hasListener('eventOne', listener)).toBe(false);
  });

  it<Context>('должен быть удален после вызова с once опцией', ({ testEmitter }) => {
    const listener = () => undefined;
    testEmitter.addListener('eventOne', listener, { once: true });
    expect(testEmitter.hasListener('eventOne', listener)).toBe(true);
    testEmitter.emit('eventOne', '');
    expect(testEmitter.hasListener('eventOne', listener)).toBe(false);
  });

  it<Context>('должен быть удален после once метода', ({ testEmitter }) => {
    const listener = () => undefined;
    testEmitter.once('eventOne', listener);
    expect(testEmitter.hasListener('eventOne', listener)).toBe(true);
    testEmitter.emit('eventOne', '');
    expect(testEmitter.hasListener('eventOne', listener)).toBe(false);
  });

  it<Context>('должен вызвать событие каждый раз, пока существует слушатель', ({ testEmitter }) => {
    let resultValue = 0;
    const testValue = 10;
    const listener = () => {
      resultValue += 1;
    };
    testEmitter.on('eventOne', listener);
    Array.from({ length: testValue }).map(() => {
      testEmitter.emit('eventOne', '');
    });
    expect(resultValue).toEqual(testValue);
    testEmitter.off('eventOne', listener);
    testEmitter.emit('eventOne', '');
    expect(resultValue).toEqual(testValue);
  });

  it<Context>('должен вызвать каждый слушатель на событие', ({ testEmitter }) => {
    let testOne = '';
    let testTwo = '';
    const resultValue = 'test';
    testEmitter.on('eventOne', () => {
      testOne = resultValue;
    });
    testEmitter.on('eventOne', () => {
      testTwo = resultValue;
    });
    testEmitter.emit('eventOne', '');
    expect(testOne).toEqual(resultValue);
    expect(testTwo).toEqual(resultValue);
  });

  it<Context>('должен вызвать правильный слушатель', ({ testEmitter }) => {
    let testOne = '';
    let testTwo = '';
    const resultValue = 'test';
    testEmitter.on('eventOne', () => {
      testOne = resultValue;
    });
    testEmitter.on('eventTwo', () => {
      testTwo = resultValue;
    });
    testEmitter.emit('eventOne', '');
    expect(testOne).toEqual(resultValue);
    expect(testTwo).toEqual('');
  });

  it<Context>('должен передавать правильные данные', ({ testEmitter }) => {
    let testOne: unknown = null;
    let testTwo: unknown = null;
    testEmitter.on('eventOne', (data) => {
      testOne = data;
    });
    testEmitter.on('eventTwo', (data) => {
      testTwo = data;
    });
    testEmitter.emit('eventOne', '');
    testEmitter.emit('eventTwo', 1);
    expect(testOne).toBeTypeOf('string');
    expect(testTwo).toBeTypeOf('number');
  });

  it<Context>('должен вызвать обработчики в порядке добавления', ({ testEmitter }) => {
    let value = 2;
    testEmitter.on('eventTwo', (data) => (value += data));
    testEmitter.on('eventTwo', (data) => (value *= data));
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);
  });

  it<Context>('должен вызвать обработчики по приоритету', ({ testEmitter }) => {
    let value = 2;
    const clear = () => {
      testEmitter.removeAllListeners();
      value = 2;
    };

    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'low' });
    testEmitter.on('eventTwo', (data) => (value *= data));
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(6);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'low' });
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'medium' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(6);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'low' });
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'high' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(6);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'medium' });
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'high' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(6);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data));
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'high' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(6);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'medium' });
    testEmitter.on('eventTwo', (data) => (value *= data));
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'high' });
    testEmitter.on('eventTwo', (data) => (value *= data));
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data));
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'low' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data));
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'medium' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'medium' });
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'low' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'high' });
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'low' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);

    clear();
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'high' });
    testEmitter.on('eventTwo', (data) => (value *= data), { priority: 'medium' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);
  });

  it<Context>('должен перезаписывать обработчик, если указан другой приоритет', ({ testEmitter }) => {
    let value = 2;

    const clear = () => {
      testEmitter.removeAllListeners();
      value = 2;
    };

    const multiply = (data: number) => (value *= data);

    testEmitter.on('eventTwo', multiply, { priority: 'low' });
    testEmitter.on('eventTwo', multiply, { priority: 'medium' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(4);

    clear();
    testEmitter.on('eventTwo', multiply, { priority: 'high' });
    testEmitter.on('eventTwo', multiply, { priority: 'low' });
    testEmitter.on('eventTwo', (data) => (value += data), { priority: 'medium' });
    testEmitter.emit('eventTwo', 2);
    expect(value).toBe(8);
  });
});
