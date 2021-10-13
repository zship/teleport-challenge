import React, { ReactElement } from 'react';
import { Router } from 'client/router/Router';
import { Header } from 'client/components/Header';

type URL = typeof window.URL.prototype;

export const App = ({ url }: { url: URL }): ReactElement => {
  return (
    <div className="App">
      <Header />
      <main>
        <Router url={url} />
      </main>
    </div>
  );
};
