import { useState, useEffect } from 'react';

type Store = {
  sessionId: string | null;
};

export let store: Store = {
  sessionId: window.localStorage.getItem('sessionId'),
};

type Subscription = () => void;

let subscriptions: Subscription[] = [];

const addListener = (fn: Subscription): void => {
  subscriptions.push(fn);
};

const removeListener = (fn: Subscription): void => {
  subscriptions = subscriptions.filter((f) => {
    return f !== fn;
  });
};

export const setStore = (nextStore: Store): void => {
  store = nextStore;
  // trigger all components which use `useStore` (below) to update
  for (const fn of subscriptions) {
    fn();
  }
};

export const useStore = (): Store => {
  // intitialize with latest global store
  const [localStore, setLocalStore] = useState(store);

  // update local store when the global store updates
  useEffect(() => {
    const fn = (): void => {
      setLocalStore(store);
    };
    addListener(fn);
    return (): void => {
      removeListener(fn);
    };
  }, []);

  return localStore;
};
