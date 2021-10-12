import { ApiError } from 'client/lib/ApiError';

export const makeRequest = async ({
  url,
  method,
  body,
}: {
  url: string;
  method: string;
  body: Record<string, unknown>;
}): Promise<Record<string, unknown>> => {
  const response = await window.fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });

  const json = (await response.json()) as unknown;

  if (!response.ok) {
    throw new ApiError(json as ApiError);
  }

  return json as Record<string, unknown>;
};
