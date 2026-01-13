import { describe, expect, it } from 'vitest';

import { ValueInitialization } from '../accessors';

describe('ValueInitialization', () => {
  it('receives initial value', () => {
    class Test {
      @ValueInitialization(function (value) {
        expect(value).toBe(5);
      })
      accessor x = 5;
    }

    new Test();
  });

  it('can replace initial value', () => {
    class Test {
      @ValueInitialization(function () {
        return 100;
      })
      accessor x = 1;
    }

    const t = new Test();
    expect(t.x).toBe(100);
  });

  it('keeps initial value when returning void', () => {
    class Test {
      @ValueInitialization(function () {
        //
      })
      accessor x = 3;
    }

    const t = new Test();
    expect(t.x).toBe(3);
  });
});
