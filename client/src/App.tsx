import React, { ReactElement } from 'react';
import { Router } from 'client/router/Router';

type URL = typeof window.URL.prototype;

export const App = ({ url }: { url: URL }): ReactElement => {
  return (
    <div className="App">
      <header />
      <Router url={url} />
    </div>
  );
};
