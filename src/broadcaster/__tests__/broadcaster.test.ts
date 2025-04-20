import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Broadcaster } from '../broadcaster';
import { IBroadcaster } from '../types';

interface Events {
  message: string;
  count: number;
  ready: boolean;
}

interface TestService extends IBroadcaster<Events> {}

@Broadcaster('test-broadcast')
class TestService {}

let instance: TestService & IBroadcaster<Events>;

beforeEach(() => {
  instance = new TestService();
});

afterEach(() => {
  instance.closeBroadcastChannel();
});

describe('Broadcaster', () => {
  it('subscribes and receives published string event', () => {
    const cb = vi.fn();
    instance.subscribe('message', cb);
    instance.publish('message', 'Hello');
    expect(cb).toHaveBeenCalledWith('Hello');
  });

  it('handles number events', () => {
    const cb = vi.fn();
    instance.subscribe('count', cb);
    instance.publish('count', 42);
    expect(cb).toHaveBeenCalledWith(42);
  });

  it('handles boolean events', () => {
    const cb = vi.fn();
    instance.subscribe('ready', cb);
    instance.publish('ready', true);
    expect(cb).toHaveBeenCalledWith(true);
  });

  it('allows unsubscribing from an event', () => {
    const cb = vi.fn();
    instance.subscribe('message', cb);
    instance.unsubscribe('message', cb);
    instance.publish('message', 'Ignored');
    expect(cb).not.toHaveBeenCalled();
  });

  it('queues events if broadcastChannel is not ready', () => {
    const cb = vi.fn();

    interface LateClass extends IBroadcaster<Events> {}

    @Broadcaster('test-broadcast-late')
    class LateClass {
      constructor() {
        this.subscribe('count', cb);
      }
    }

    const lateInstance = new LateClass();

    lateInstance.publish('count', 123);

    expect(cb).toHaveBeenCalledWith(123);
  });

  it('calls multiple subscribers for the same event', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    instance.subscribe('message', cb1);
    instance.subscribe('message', cb2);
    instance.publish('message', 'Hi');
    expect(cb1).toHaveBeenCalledWith('Hi');
    expect(cb2).toHaveBeenCalledWith('Hi');
  });

  it('removes subscriber only from specified event', () => {
    const cb = vi.fn();
    instance.subscribe('message', cb);
    instance.subscribe('ready', cb);
    instance.unsubscribe('message', cb);
    instance.publish('ready', true);
    instance.publish('message', 'ignored');
    expect(cb).toHaveBeenCalledWith(true);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('prohibits publishing after BroadcastChannel is closed', () => {
    instance.closeBroadcastChannel();

    expect(() => {
      instance.publish('message', 'after close');
    }).toThrowError('BroadcastChannel is closed');
  });

  it('supports multiple instances without interference', () => {
    interface ServiceA extends IBroadcaster<Events> {}
    interface ServiceB extends IBroadcaster<Events> {}

    @Broadcaster('channel-A')
    class ServiceA {}

    @Broadcaster('channel-B')
    class ServiceB {}

    const a = new ServiceA();
    const b = new ServiceB();

    const cbA = vi.fn();
    const cbB = vi.fn();

    a.subscribe('count', cbA);
    b.subscribe('count', cbB);

    a.publish('count', 1);
    b.publish('count', 2);

    expect(cbA).toHaveBeenCalledWith(1);
    expect(cbB).toHaveBeenCalledWith(2);
    expect(cbA).toHaveBeenCalledTimes(1);
    expect(cbB).toHaveBeenCalledTimes(1);
  });

  it.skip('reuses the same BroadcastChannel if same name is used', () => {
    interface ServiceA extends IBroadcaster<Events> {}
    interface ServiceB extends IBroadcaster<Events> {}

    @Broadcaster('shared-channel')
    class ServiceA {}

    @Broadcaster('shared-channel')
    class ServiceB {}

    const a = new ServiceA();
    const b = new ServiceB();

    const cb = vi.fn();
    b.subscribe('message', cb);
    a.publish('message', 'hello shared');

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('hello shared');

    a.closeBroadcastChannel();
    b.closeBroadcastChannel();
  });
});
