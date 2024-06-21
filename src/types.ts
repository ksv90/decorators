// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<TInstance extends object = object, TArgs extends [] = any> = abstract new (...args: TArgs) => TInstance;

export type ClassDecorator<TConstructor extends Constructor, TOutput extends TConstructor | void = TConstructor | void> = (
  Target: TConstructor,
  context: ClassDecoratorContext<TConstructor>,
) => TOutput;

export type AccessorDecorator<TThis, TValue> = (
  target: ClassAccessorDecoratorTarget<TThis, TValue>,
  context: ClassAccessorDecoratorContext<TThis, TValue>,
) => ClassAccessorDecoratorResult<TThis, TValue>;
