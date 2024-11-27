import { ClassDecorator, Constructor } from '../types';

export const PropertyDescriptor = <TConstructor extends Constructor>(
  propertyKey: PropertyKey,
  propertyDescriptor: PropertyDescriptor,
): ClassDecorator<TConstructor> => {
  return (Target) => {
    Object.defineProperty(Target.prototype, propertyKey, propertyDescriptor);
  };
};

export const PropertyDescriptorMap = <TConstructor extends Constructor>(
  propertyDescriptorMap: PropertyDescriptorMap,
): ClassDecorator<TConstructor> => {
  return (Target) => {
    Object.defineProperties(Target.prototype, propertyDescriptorMap);
  };
};
