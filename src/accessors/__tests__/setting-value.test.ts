import { describe, expect, it, vi } from 'vitest';

import { SettingValue } from '../accessors';

describe('SettingValue', () => {
  it('sets value without modification', () => {
    class Test {
      @SettingValue((_next) => {
        // side-effect only
      })
      accessor x = 100;
    }

    const t = new Test();
    expect(t.x).toBe(100);

    t.x = 200;
    expect(t.x).toBe(200);
  });

  it('receives previous value', () => {
    const spy = vi.fn();

    class Test {
      @SettingValue(function (_next, prev) {
        spy(prev);
      })
      accessor x = 1;
    }

    const t = new Test();
    t.x = 2;

    expect(spy).toHaveBeenCalledWith(1);
  });

  it('can transform value', () => {
    class Test {
      @SettingValue(function (next) {
        return next * 2;
      })
      accessor x = 10;
    }

    const t = new Test();
    t.x = 5;

    expect(t.x).toBe(10);
  });

  it('keeps value when returning void', () => {
    class Test {
      @SettingValue(function () {
        //
      })
      accessor x = 7;
    }

    const t = new Test();
    t.x = 9;

    expect(t.x).toBe(9);
  });
});
