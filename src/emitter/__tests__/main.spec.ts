import { describe, expect, it } from 'vitest';

import { Emitter } from '../emitter';
import { IEmitter } from '../types';

describe('main', () => {
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
});
