import { useState, useEffect } from 'react';
import { ApiError } from 'client/lib/ApiError';

type Store = {
  sessionId: string | null;
};

let store: Store = {
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

export const setSessionId = (sessionId: string | null): void => {
  if (sessionId === null) {
    window.localStorage.removeItem('sessionId');
  } else {
    window.localStorage.setItem('sessionId', sessionId);
  }

  setStore({
    sessionId,
  });
};

/*
 * makeAuthenticatedRequest
 *
 * Keeps client login state in sync with the server. All authenticated requests
 * should be wrapped inside `makeAuthenticatedRequest`. When any server response
 * indicates that the session is invalid or expired, we mark the user "logged
 * out" by clearing the in-memory sessionId and the localStorage sessionId.
 */
export const makeAuthenticatedRequest = async <T>(
  fn: (sessionId: string) => Promise<T>,
): Promise<T> => {
  if (store.sessionId === null) {
    throw new ApiError({
      code: 'auth/sessionInvalid',
    });
  }

  try {
    const response = await fn(store.sessionId);
    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      if (
        err.code === 'auth/sessionInvalid' ||
        err.code === 'auth/sessionExpired'
      ) {
        setSessionId(null);
      }
    }
    throw err;
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
