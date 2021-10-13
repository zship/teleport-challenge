import { ErrorWithCode } from 'server/lib/ErrorWithCode';
import { makeRequestHandler } from 'server/lib/makeRequestHandler';
import * as Session from 'server/model/session';

export const handlePostLogout = makeRequestHandler((req, res) => {
  const sessionId = req.header('session-id');
  if (sessionId === undefined) {
    throw new ErrorWithCode({
      code: 'auth/sessionInvalid',
      message: `Logout failed because you don't appear to be logged in...`,
    });
  }

  Session.del(sessionId);
  res.status(200).end();
});
