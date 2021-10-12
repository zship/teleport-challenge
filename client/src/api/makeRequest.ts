import { ApiError } from 'client/lib/ApiError';

export const makeRequest = async ({
  url,
  method,
  body,
  headers,
}: {
  url: string;
  method: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}): Promise<unknown> => {
  let opts: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    opts = {
      ...opts,
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
    };
  }

  const response = await window.fetch(url, opts);
  const json = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(json as ApiError);
  }

  return json as Record<string, unknown>;
};
