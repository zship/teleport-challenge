import {
  Request,
  Response,
  ParamsDictionary,
  Query,
  NextFunction,
} from 'express-serve-static-core';

/*
 * makeRequestHandler
 *
 * Wraps a request handler, trapping both sync and async Errors and forwarding
 * them to the next() handler (where they will eventually be picked up by the
 * last handler in the chain which handles errors). Express 4.x already does
 * this with sync Errors, but not with async ones.
 */
export const makeRequestHandler = <
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>
>(
  handler: (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
  ) => Promise<void> | void,
) => (
  req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
  res: Response<ResBody, Locals>,
  next: NextFunction,
): void => {
  try {
    const result = handler(req, res);
    if (result && result.then) {
      result.catch((err) => {
        next(err);
      });
    }
  } catch (err) {
    next(err);
  }
};
