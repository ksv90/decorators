import { describe, expect, it } from 'vitest';

import { GettingValue } from '../accessors';

describe('GettingValue', () => {
  it('returns stored value by default', () => {
    class Test {
      @GettingValue(function () {
        //
      })
      accessor x = 42;
    }

    const t = new Test();
    expect(t.x).toBe(42);
  });

  it('can transform returned value', () => {
    class Test {
      @GettingValue(function (value) {
        return value + 1;
      })
      accessor x = 10;
    }

    const t = new Test();
    expect(t.x).toBe(11);
  });

  it('does not affect setter behavior', () => {
    class Test {
      @GettingValue(function (value) {
        return value * 10;
      })
      accessor x = 2;
    }

    const t = new Test();
    t.x = 3;

    expect(t.x).toBe(30);
  });
});
