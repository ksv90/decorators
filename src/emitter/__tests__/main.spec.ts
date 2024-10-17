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

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(t1.addListener).toEqual(t2.addListener);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(t1.removeListener).toEqual(t2.removeListener);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(t1.emit).toEqual(t2.emit);
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

    function listener() {}

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
});
