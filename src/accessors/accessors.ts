import { AccessorDecorator } from '../types';

export const ValueInitialization = <TThis, TValue>(fn: {
  (this: TThis, value: TValue): void;
  (this: TThis, value: TValue): TValue;
}): AccessorDecorator<TThis, TValue> => {
  return () => ({
    init(value) {
      const data = fn.call(this, value);
      return data ?? value;
    },
  });
};

export const SettingValue = <TThis, TValue>(fn: {
  (this: TThis, nextValue: TValue, prevValue: TValue): void;
  (this: TThis, nextValue: TValue, prevValue: TValue): TValue;
}): AccessorDecorator<TThis, TValue> => {
  return (target) => ({
    set(value) {
      const prevValue = target.get.call(this);
      const data = fn.call(this, value, prevValue);
      target.set.call(this, data ?? value);
    },
  });
};

export const GettingValue = <TThis, TValue>(fn: {
  (this: TThis, value: TValue): void;
  (this: TThis, value: TValue): TValue;
}): AccessorDecorator<TThis, TValue> => {
  return (target) => ({
    get() {
      const value = target.get.call(this);
      const data = fn.call(this, value);
      return data ?? value;
    },
  });
};
