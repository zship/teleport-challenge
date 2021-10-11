import { randomBytes } from 'crypto';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { getPasswordHash } from 'server/lib/auth';
import { ErrorWithCode } from 'server/lib/ErrorWithCode';
import { makeRequestHandler } from 'server/lib/makeRequestHandler';
import * as Session from 'server/model/session';
import * as User from 'server/model/user';

type RequestBody = {
  username: string;
  password: string;
};

type ResponseBody = {
  sessionId: string;
};

const dummySalt = randomBytes(128);

const isPasswordCorrectTimingInvariant = async ({
  password,
  user,
}: {
  password: string;
  user: User.User | undefined;
}): Promise<boolean> => {
  if (user === undefined) {
    await getPasswordHash({
      password,
      salt: dummySalt,
    });
    return false;
  } else {
    const passwordHash = await getPasswordHash({
      password,
      salt: Buffer.from(user.salt, 'hex'),
    });
    if (passwordHash !== user.passwordHash) {
      return false;
    }
    return true;
  }
};

const createSessionTimingInvariant = ({
  isPasswordCorrect,
  user,
}: {
  isPasswordCorrect: boolean;
  user: User.User | undefined;
}): Session.Session | undefined => {
  if (isPasswordCorrect === false || user === undefined) {
    // fake the only semi-expensive part of session creation (the CSRNG)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dummySessionId = randomBytes(128).toString('hex');
    return undefined;
  } else {
    return Session.create({ username: user.username, scopes: user.scopes });
  }
};

export const handlePostLogin = makeRequestHandler<
  ParamsDictionary,
  ResponseBody,
  RequestBody
>(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new ErrorWithCode({
      code: 'login/validation/username',
      message: 'username is required',
    });
  }

  if (!password) {
    throw new ErrorWithCode({
      code: 'login/validation/password',
      message: 'password is required',
    });
  }

  // Function calls below should attempt to be timing-invariant, i.e. aware of
  // timing attacks. For example, `isPasswordCorrectForUser` accepts an
  // `undefined` user parameter and has the same running time regardless.
  const user = User.getByUsername(username);

  const isPasswordCorrect = await isPasswordCorrectTimingInvariant({
    password,
    user,
  });

  const session = createSessionTimingInvariant({
    isPasswordCorrect,
    user,
  });

  if (session === undefined) {
    throw new ErrorWithCode({
      code: 'login/failed',
      message: `The user doesn't exist, or the supplied password was incorrect.`,
    });
  }

  res.json({
    sessionId: session.id,
  });
});
