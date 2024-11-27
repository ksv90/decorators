import { describe, expect, it, vi } from 'vitest';

import { Emitter } from '../emitter';
import { IEmitter } from '../types';

describe('emitter main', () => {
  it('должен хранить ссылки на методы', () => {
    interface IEvents {
      balance: [];
    }

    interface T1 extends IEmitter<IEvents> {}
    @Emitter()
    class T1 {}

    interface T2 extends IEmitter<IEvents> {}
    @Emitter()
    class T2 {}

    const t1 = new T1();
    const t2 = new T2();

    expect(void t1.addListener).toEqual(void t2.addListener);

    expect(void t1.removeListener).toEqual(void t2.removeListener);

    expect(void t1.emit).toEqual(void t2.emit);
  });

  it('должен иметь свою карту с обработчиками', () => {
    interface IEvents {
      balance: [];
    }

    interface T1 extends IEmitter<IEvents> {}
    @Emitter()
    class T1 {}

    interface T2 extends IEmitter<IEvents> {}
    @Emitter()
    class T2 {}

    const t1 = new T1();
    const t2 = new T2();

    const listener = () => undefined;

    t1.addListener('balance', listener);

    expect(t1.hasListener('balance', listener)).toBe(true);
    expect(t2.hasListener('balance', listener)).toBe(false);
  });

  it('должен позволять вызывать методы из конструктора', () => {
    interface IEvents {
      balance: [];
    }

    interface T1 extends IEmitter<IEvents> {}

    const spy1 = vi.fn();

    @Emitter()
    class T1 {
      constructor() {
        this.on('balance', spy1);
      }
    }

    interface T2 extends IEmitter<IEvents> {}

    const spy2 = vi.fn();

    @Emitter()
    class T2 {
      constructor() {
        this.on('balance', spy2);
        this.emit('balance');
      }
    }

    new T1().emit('balance');
    new T2();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('должен иметь общие функции на прототипе', () => {
    interface EventEmitter1 extends IEmitter<object> {}
    @Emitter()
    class EventEmitter1 {}
    const emitter1 = new EventEmitter1();
    interface EventEmitter2 extends IEmitter<object> {}
    @Emitter()
    class EventEmitter2 {}
    const emitter2 = new EventEmitter2();
    expect(void emitter1.addListener).toEqual(void emitter2.addListener);
    expect(void emitter1.removeListener).toEqual(void emitter2.removeListener);
    expect(void emitter1.emit).toEqual(void emitter2.emit);
  });
});
