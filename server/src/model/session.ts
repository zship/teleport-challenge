import { randomBytes } from 'crypto';
import { Request } from 'express-serve-static-core';
import { ErrorWithCode } from 'server/lib/ErrorWithCode';
import { Scope } from './user';

export type SessionId = string;

export type Session = {
  id: SessionId;
  username: string;
  scopes: string[];
  lastActivityTimestamp: number;
  expirationTimestamp: number;
};

// 30 minutes
export const MAX_IDLE_TIME = 30 * 60 * 1000;
// 8 hours
export const MAX_SESSION_TIME = 8 * 60 * 60 * 1000;

type SessionStore = Map<SessionId, Session>;

const sessionStore: SessionStore = new Map();

export const getBySessionId = (sessionId: string): Session | undefined => {
  return sessionStore.get(sessionId);
};

export const create = ({
  username,
  scopes,
}: {
  username: string;
  scopes: string[];
}): Session => {
  const id = randomBytes(128 / 8).toString('hex');
  const now = Date.now();
  const session: Session = {
    id,
    username,
    scopes,
    lastActivityTimestamp: now,
    expirationTimestamp: now + MAX_SESSION_TIME,
  };
  sessionStore.set(id, session);
  return session;
};

export const update = (session: Session): void => {
  sessionStore.set(session.id, session);
};

export const del = (sessionId: SessionId): void => {
  sessionStore.delete(sessionId);
};

export const assertAuthorized = (req: Request, scopes: Scope[]): void => {
  const sessionId = req.header('session-id');
  if (sessionId === undefined) {
    throw new ErrorWithCode({
      code: 'auth/sessionInvalid',
      message: 'The Session-Id used in the request is invalid',
    });
  }

  const session = getBySessionId(sessionId);
  if (session === undefined) {
    throw new ErrorWithCode({
      code: 'auth/sessionInvalid',
      message: 'The Session-Id used in the request is invalid',
    });
  }

  for (const scope of scopes) {
    if (!session.scopes.includes(scope)) {
      throw new ErrorWithCode({
        code: 'auth/notAuthorized',
        message: `This request requires the "${scope}" scope`,
      });
    }
  }
};
