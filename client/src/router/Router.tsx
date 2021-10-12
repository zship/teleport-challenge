import React, { ReactElement } from 'react';

import { FileBrowser } from 'client/components/FileBrowser';
import { LoginWrapper } from 'client/components/LoginWrapper';
import { useStore } from 'client/store';
import { gotoRoute } from './gotoRoute';

type URL = typeof window.URL.prototype;

export const Router = ({ url }: { url: URL }): ReactElement => {
  const store = useStore();
  const isLoggedIn = store.sessionId !== null;

  const path = url.pathname;

  if (path === '/') {
    gotoRoute('/filebrowser');
    return <div />;
  }

  if (path.startsWith('/login')) {
    return <LoginWrapper url={url} />;
  }

  // all routes beyond this point require authentication
  if (!isLoggedIn) {
    const redirect = window.encodeURIComponent(`${url.pathname}${url.search}`);
    gotoRoute(`/login?redirect=${redirect}`);
    return <div />;
  }

  if (path.startsWith('/filebrowser')) {
    return <FileBrowser />;
  }

  return <div>404</div>;
};
