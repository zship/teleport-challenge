import React, { ReactElement } from 'react';
import { makeAuthenticatedRequest, setSessionId } from 'client/store';
import { useStore } from 'client/store';
import { logout } from 'client/api/logout';

export const Header = (): ReactElement => {
  const store = useStore();
  const isLoggedIn = store.sessionId !== null;

  const onClickLogout = (): void => {
    void makeAuthenticatedRequest(async (sessionId) => {
      await logout(sessionId);
      setSessionId(null);
    });
  };

  return (
    <header>
      {isLoggedIn ? (
        <button className="logout" onClick={onClickLogout}>
          Log out
        </button>
      ) : null}
    </header>
  );
};
