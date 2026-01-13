import { describe, expect, it } from 'vitest';

import { GettingValue, SettingValue, ValueInitialization } from '../accessors';

describe('Accessor composition', () => {
  it('works correctly when combined', () => {
    class Test {
      @ValueInitialization(() => 10)
      @SettingValue((next) => next + 1)
      @GettingValue((value) => value * 2)
      accessor x = 0;
    }

    const t = new Test();

    // init: 10
    // get: 10 * 2
    expect(t.x).toBe(20);

    // set: (5 + 1) = 6
    // get: 6 * 2
    t.x = 5;
    expect(t.x).toBe(12);
  });
});

describe('Accessors - this and null handling', () => {
  it('should preserve this context', () => {
    class Test {
      public flag = false;

      @SettingValue(function (next, prev) {
        if (next !== prev) this.flag = true;
      })
      accessor x: number | null = 0;
    }

    const t = new Test();
    expect(t.flag).toBe(false);

    t.x = 42;
    expect(t.flag).toBe(true);
  });

  it('should handle null values', () => {
    class Test {
      @SettingValue(function (next) {
        return next ?? 10; // если null, подставляем дефолт
      })
      accessor x: number | null = null;
    }

    const t = new Test();

    // init
    expect(t.x).toBeNull();

    // установка значения
    t.x = 5;
    expect(t.x).toBe(5);

    // переустановка null
    t.x = null;
    expect(t.x).toBe(10); // default из сеттера
  });

  it('should handle init replacement', () => {
    class Test {
      @ValueInitialization(function (_value) {
        return 100;
      })
      accessor x: number | null = null;
    }

    const t = new Test();
    expect(t.x).toBe(100);
  });

  it('should compose init + set + get', () => {
    class Test {
      public flag = false;

      @ValueInitialization(() => 5)
      @SettingValue(function (next, prev) {
        if (next !== prev) this.flag = true;
      })
      @GettingValue((value) => Number(value) * 2)
      accessor x: number | null = null;
    }

    const t = new Test();

    // init + get
    expect(t.x).toBe(10); // 5 * 2
    expect(t.flag).toBe(false);

    // set triggers flag and get transforms
    t.x = 7;
    expect(t.flag).toBe(true);
    expect(t.x).toBe(14); // get: 7*2

    // set null should pass through
    t.x = null;
    expect(t.flag).toBe(true);
    expect(t.x).toBe(0); // get: null -> passthrough 0
  });

  it('should work with generics and null', () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    class GenericBehavior<T> {
      @SettingValue(function (_next, _prev) {
        this.called = true;
      })
      accessor value: T | null = null;

      public called = false;
    }

    const inst = new GenericBehavior<string>();
    expect(inst.value).toBeNull();
    expect(inst.called).toBe(false);

    inst.value = 'hello';
    expect(inst.value).toBe('hello');
    expect(inst.called).toBe(true);

    inst.value = null;
    expect(inst.value).toBeNull();
    expect(inst.called).toBe(true);
  });

  it('should return null', () => {
    class Test {
      @ValueInitialization(() => null)
      @SettingValue(() => null)
      accessor value: number | null = 100;
    }

    const inst = new Test();
    expect(inst.value).toBeNull();

    inst.value = 200;
    expect(inst.value).toBeNull();

    inst.value = null;
    expect(inst.value).toBeNull();
  });
});
