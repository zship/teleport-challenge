import { makeRequest } from './makeRequest';

export type Entry = {
  name: string;
  type: 'file' | 'directory';
  size: number;
};

export const filebrowser = async ({
  path,
  sessionId,
}: {
  path: string;
  sessionId: string;
}): Promise<Entry[]> => {
  const encodedPath = window.encodeURIComponent(path);

  const response = await makeRequest({
    method: 'GET',
    url: `/api/filebrowser/${encodedPath}`,
    headers: {
      'Session-Id': sessionId,
    },
  });

  return response as Entry[];
};
