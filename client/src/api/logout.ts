import { makeRequest } from './makeRequest';

export const logout = async (sessionId: string): Promise<void> => {
  await makeRequest({
    method: 'POST',
    url: '/api/logout',
    headers: {
      'Session-Id': sessionId,
    },
  });
};
