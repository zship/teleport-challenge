import { store, setStore } from 'client/store';
import { ApiError } from 'client/lib/ApiError';

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
