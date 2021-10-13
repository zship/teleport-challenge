import { makeRequest } from './makeRequest';

type LoginResponse = {
  sessionId: string;
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

  return response as LoginResponse;
};
