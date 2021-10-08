import { randomBytes } from 'crypto';
import { Request } from 'express-serve-static-core';
import { newError } from 'server/lib/error';
import { Scope } from './user';

export type SessionId = string;

export type Session = {
  id: SessionId;
  username: string;
  scopes: string[];
  lastActivityTimestamp: number;
  expirationTimestamp: number;
};

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
    expirationTimestamp: now + 8 * 60 * 60 * 1000,
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
    throw newError({
      statusCode: 401,
      code: 'auth/sessionInvalid',
      message: 'The Session-Id used in the request is invalid',
    });
  }

  const session = getBySessionId(sessionId);
  if (session === undefined) {
    throw newError({
      statusCode: 401,
      code: 'auth/sessionInvalid',
      message: 'The Session-Id used in the request is invalid',
    });
  }

  for (const scope of scopes) {
    if (!session.scopes.includes(scope)) {
      throw newError({
        statusCode: 403,
        code: 'auth/notAuthorized',
        message: `This request requires the "${scope}" scope`,
      });
    }
  }
};
