import { ApiError, ErrorCode } from 'client/lib/ApiError';

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

  const json = (await response.json()) as Record<string, unknown>;

  if (response.status >= 400) {
    let code: ErrorCode = 'unknown';
    if ('code' in json && typeof json.code === 'string') {
      code = json.code as ErrorCode;
    }
    let message = '';
    if ('message' in json && typeof json.message === 'string') {
      message = json.message;
    }
    throw new ApiError({
      code,
      message,
    });
  }

  return json;
};
