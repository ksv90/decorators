import { AccessorDecorator } from '../types';

export const ValueInitialization = <TThis, TValue>(
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  fn: (this: TThis, value: NoInfer<TValue>) => void | NoInfer<TValue>,
): AccessorDecorator<TThis, TValue> => {
  return (_target, _context) => ({
    init(value) {
      const result = fn.call(this, value);
      return result === void 0 ? value : result;
    },
  });
};

export const SettingValue = <TThis, TValue>(
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  fn: (this: TThis, nextValue: NoInfer<TValue>, prevValue: NoInfer<TValue>) => void | NoInfer<TValue>,
): AccessorDecorator<TThis, TValue> => {
  return (target, _context) => ({
    set(value) {
      const prevValue = target.get.call(this);
      const result = fn.call(this, value, prevValue);
      target.set.call(this, result === void 0 ? value : result);
    },
  });
};

export const GettingValue = <TThis, TValue>(
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  fn: (this: TThis, value: NoInfer<TValue>) => void | NoInfer<TValue>,
): AccessorDecorator<TThis, TValue> => {
  return (target, _context) => ({
    get() {
      const value = target.get.call(this);
      const result = fn.call(this, value);
      return result === void 0 ? value : result;
    },
  });
};
