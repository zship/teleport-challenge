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

  const text = await response.text();
  if (!text) {
    // the server only sends empty responses on success
    return;
  }

  const json = JSON.parse(text) as unknown;
  if (!response.ok) {
    throw new ApiError(json as ApiError);
  }
  return json;
};
