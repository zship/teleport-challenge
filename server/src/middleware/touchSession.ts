import { RequestHandler } from 'express-serve-static-core';
import { ErrorWithCode, newError } from 'server/lib/error';
import { MAX_IDLE_TIME, MAX_SESSION_TIME, Session } from 'server/model/session';
import * as SessionModel from 'server/model/session';

export type Action =
  | {
      type: 'session/delete';
    }
  | {
      type: 'session/update';
      session: Session;
    }
  | {
      type: 'error';
      error: ErrorWithCode;
    };

// "touchSession" middleware does session bookkeeping on every request. It is
// split into two parts to facilitate testing: getActions (stateless, here)
// and "touchSession" (stateful, below).
export const getActions = ({
  session,
  currentTimestamp,
}: {
  session: Session;
  currentTimestamp: number;
}): Action[] => {
  const idleElapsed =
    currentTimestamp - session.lastActivityTimestamp;
  if (idleElapsed >= MAX_IDLE_TIME) {
    return [
      { type: 'session/delete' },
      {
        type: 'error',
        error: newError({
          statusCode: 401,
          code: 'auth/sessionExpired',
          message: 'The Session-Id used in the request has expired',
        }),
      },
    ];
  }

  const absElapsed = currentTimestamp - session.expirationTimestamp;
  if (absElapsed >= MAX_SESSION_TIME) {
    return [
      { type: 'session/delete' },
      {
        type: 'error',
        error: newError({
          statusCode: 401,
          code: 'auth/sessionExpired',
          message: 'The Session-Id used in the request has expired',
        }),
      },
    ];
  }

  return [
    {
      type: 'session/update',
      session: {
        ...session,
        lastActivityTimestamp: currentTimestamp,
      },
    },
  ];
};

export const touchSession: RequestHandler = (req, res, next) => {
  const sessionId = req.header('session-id');
  if (sessionId === undefined) {
    next();
    return;
  }

  const session = SessionModel.getBySessionId(sessionId);
  if (session === undefined) {
    next();
    return;
  }

  const actions = getActions({
    session,
    currentTimestamp: Date.now(),
  });

  for (const action of actions) {
    if (action.type === 'session/delete') {
      SessionModel.del(sessionId);
    } else if (action.type === 'session/update') {
      SessionModel.update(action.session);
    } else if (action.type === 'error') {
      next(action.error);
      return;
    }
  }

  next();
};
