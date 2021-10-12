import React, { ReactElement, useState } from 'react';

import { login } from 'client/api/login';
import { gotoRoute } from 'client/router/gotoRoute';
import { useStore } from 'client/store';
import { setSessionId } from 'client/store';
import { Login, LoginFunction } from './Login';

type URL = typeof window.URL.prototype;
type LoadingState = 'unsent' | 'loading' | 'done' | 'error';

const DEFAULT_REDIRECT = '/filebrowser';

const getRedirectPath = (url: URL): string => {
  let redirect = url.searchParams.get('redirect');
  if (redirect === null) {
    return DEFAULT_REDIRECT;
  }
  redirect = window.decodeURIComponent(redirect);
  // Prevent unvalidated redirects by not allowing `redirect` to be a full URL
  // (e.g. "http://google.com"). Instead `redirect` must be an app-relative
  // path (e.g. "/filebrowser").
  if (!redirect.startsWith('/')) {
    return DEFAULT_REDIRECT;
  }
  return redirect;
};

export const LoginWrapper = ({ url }: { url: URL }): ReactElement => {
  const [loadingState, setLoadingState] = useState<LoadingState>('unsent');
  const [loginError, setLoginError] = useState<string | null>(null);

  const store = useStore();
  const isLoggedIn = store.sessionId !== null;

  if (isLoggedIn) {
    const redirect = getRedirectPath(url);
    gotoRoute(redirect);
  }

  const tryLogin: LoginFunction = async ({ username, password }) => {
    try {
      setLoadingState('loading');
      const response = await login({ username, password });
      setLoadingState('done');
      setSessionId(response.sessionId);
      const redirect = getRedirectPath(url);
      gotoRoute(redirect);
    } catch (err) {
      setLoadingState('error');
      if (err instanceof Error) {
        setLoginError(err.message);
      }
    }
  };

  return (
    <Login
      callLoginApi={tryLogin}
      loadingState={loadingState}
      loginApiError={loginError}
    />
  );
};
