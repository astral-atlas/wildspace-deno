export type FrameSchedulerCallback<T> = (event: T) => unknown;

export type FrameSchedulerSubscription<T> = {
  unsubscribe: () => void,
  callback: FrameSchedulerCallback<T>,
  key: string,
};

export type FrameSchedulerEmitter<T> = {
  subscribe: (
    key: string,
    callback: FrameSchedulerCallback<T>
  ) => FrameSchedulerSubscription<T>,
  invoke: (event: T) => unknown,
};

export const createFrameSchedulerEmitter = <T>(): FrameSchedulerEmitter<T> => {
  const subscribers = new Set<FrameSchedulerSubscription<T>>();

  const subscribe = (key: string, callback: FrameSchedulerCallback<T>) => {
    const unsubscribe = () => {
      subscribers.delete(subscription);
    }; 
    const subscription = { key, callback, unsubscribe };
    subscribers.add(subscription);
    
    return subscription;
  };

  const invoke = (event: T) => {
    for (const subscriber of subscribers) {
      subscriber.callback(event);
    }
  };

  return { subscribe, invoke }
};
