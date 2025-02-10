import { emitterMap, HIGH_PRIORITY, LOW_PRIORITY } from './constants';
import { EventMap, IEmitterLite, Listener, Options, Priority } from './types';

type PrioritySortingParams = [unknown, { priority?: Priority } | undefined];

export const sortByPriority = ([, a]: PrioritySortingParams, [, b]: PrioritySortingParams): number => {
  const getPriorityValue = (priority?: Priority) => (priority === HIGH_PRIORITY ? -1 : priority === LOW_PRIORITY ? 1 : 0);
  return getPriorityValue(a?.priority) - getPriorityValue(b?.priority);
};

type ListenerMap<TEventName extends PropertyKey, TData extends unknown[], TContext extends object | undefined> = Map<
  Listener<TEventName, TData, TContext>,
  Options<TData, TContext> | undefined
>;

type ListenerEventNameMap<TEventName extends PropertyKey, TData extends unknown[], TContext extends object | undefined> = Map<
  TEventName,
  ListenerMap<TEventName, TData, TContext>
>;

export const getMapByTarget = <TEvents extends EventMap<TEvents>, TEventName extends keyof TEvents, TContext extends object | undefined>(
  target: IEmitterLite<TEvents>,
): ListenerEventNameMap<TEventName, TEvents[TEventName], TContext> => {
  let listenerEventNameMap = emitterMap.get(target) as ListenerEventNameMap<TEventName, TEvents[TEventName], TContext> | undefined;
  if (!listenerEventNameMap) {
    listenerEventNameMap = new Map();
    emitterMap.set(target, listenerEventNameMap);
  }
  return listenerEventNameMap;
};
