export type ErrorWithCode = Error & {
  code: string;
  statusCode: number;
};

export const newError = ({
  code,
  statusCode,
  message,
}: {
  code: string;
  statusCode?: number;
  message: string;
}): ErrorWithCode => {
  const err = new Error(message) as ErrorWithCode;
  err.code = code;
  err.statusCode = statusCode || 500;
  return err;
};

export const isErrorWithCode = (obj: unknown): obj is ErrorWithCode => {
  if (typeof obj !== 'object') {
    return false;
  }
  if (obj === null) {
    return false;
  }

  return 'stack' in obj && 'code' in obj && 'message' in obj;
};
