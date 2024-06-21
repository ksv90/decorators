import { AccessorDecorator } from '../types';

export const ValueInitialization = <TThis, TValue, TOutput extends TValue>(
  fn: (this: TThis, value: TValue) => TOutput | void,
): AccessorDecorator<TThis, TValue> => {
  return () => ({
    init(value) {
      const data = fn.call(this, value);
      return data !== undefined ? data : value;
    },
  });
};

export const SettingValue = <TThis, TValue, TOutput extends TValue>(
  fn: (this: TThis, nextValue: TValue, prevValue: TValue) => TOutput | void,
): AccessorDecorator<TThis, TValue> => {
  return (target) => ({
    set(value) {
      const prevValue = target.get.call(this);
      const data = fn.call(this, value, prevValue);
      target.set.call(this, data !== undefined ? data : value);
    },
  });
};

export const GettingValue = <TThis, TValue, TResult extends TValue>(
  fn: (this: TThis, value: TValue) => TResult | void,
): AccessorDecorator<TThis, TValue> => {
  return (target) => ({
    get() {
      const value = target.get.call(this);
      const data = fn.call(this, value);
      return data !== undefined ? data : value;
    },
  });
};
