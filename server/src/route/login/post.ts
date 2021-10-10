import { randomBytes } from 'crypto';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { getPasswordHash } from 'server/lib/auth';
import { ErrorWithCode } from 'server/lib/ErrorWithCode';
import * as Session from 'server/model/session';
import * as User from 'server/model/user';

type RequestBody = {
  username: string;
  password: string;
};

type ResponseBody = {
  sessionId: string;
};

const dummySalt = randomBytes(128).toString('hex');

export const handlePostLogin: RequestHandler<
  ParamsDictionary,
  ResponseBody,
  RequestBody
> = async (req, res, next) => {
  const { username, password } = req.body;

  if (username === undefined || password === undefined) {
    const err = new ErrorWithCode({
      code: 'login/validation/username',
      message: 'username is required',
    });
    next(err);
    return;
  }

  if (password === undefined) {
    const err = new ErrorWithCode({
      code: 'login/validation/password',
      message: 'password is required',
    });
    next(err);
    return;
  }

  // Timing attacks: avoid returning early. Instead track whether or not an
  // error occurred and handle that error at the very end.
  let errorDidOccur = false;

  const user: User.User = User.getByUsername(username) || {
    username: '',
    scopes: [],
    passwordHash: '',
    salt: dummySalt,
  };

  const passwordHash = await getPasswordHash({
    password,
    salt: Buffer.from(user.salt, 'hex'),
  });

  if (passwordHash !== user.passwordHash) {
    errorDidOccur = true;
  }

  if (errorDidOccur === true) {
    // fake the only semi-expensive part of session creation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dummySessionId = randomBytes(128).toString('hex');
    const err = new ErrorWithCode({
      code: 'login/failed',
      message: `The user doesn't exist, or the supplied password was incorrect.`,
    });
    next(err);
  } else {
    const session = Session.create({ username, scopes: user.scopes });
    res.json({
      sessionId: session.id,
    });
  }
};
