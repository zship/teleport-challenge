import { ErrorWithCode } from 'client/lib/ErrorWithCode';
import { makeRequest } from './makeRequest';

type LoginResponse = {
  sessionId: string;
};

const isLoginResponse = (
  obj: Record<string, unknown>,
): obj is LoginResponse => {
  return typeof obj.sessionId === 'string';
};

export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<LoginResponse> => {
  const body = {
    username,
    password,
  };

  const response = await makeRequest({
    method: 'POST',
    url: '/api/login',
    body,
  });

  if (!isLoginResponse(response)) {
    throw new ErrorWithCode({
      code: 'api/unexpectedResponse',
      message: 'Something unexpected went wrong. Please try again later.',
    });
  }

  return response;
};
