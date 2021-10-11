import { ErrorRequestHandler } from 'express';
import { ErrorWithCode, ErrorCode } from 'server/lib/ErrorWithCode';

const httpStatusCodeMap: Record<ErrorCode, number> = {
  'auth/sessionInvalid': 401,
  'auth/sessionExpired': 401,
  'auth/notAuthorized': 403,
  'login/validation/username': 400,
  'login/validation/password': 400,
  'login/failed': 400,
};

export const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ErrorWithCode) {
    const statusCode = httpStatusCodeMap[err.code];
    res.status(statusCode);
    res.json({
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
    return;
  }
  if (err instanceof Error) {
    res.status(500);
    res.json({
      message: err.message,
      stack: err.stack,
    });
    return;
  }
  next(err);
};
