const normalizeArray = (parts: string[]): string[] => {
  const result: string[] = [];

  for (const p of parts) {
    // ignore empty parts
    if (!p || p === '.') {
      continue;
    }

    if (p === '..') {
      if (result.length && result[result.length - 1] !== '..') {
        result.pop();
      }
    } else {
      result.push(p);
    }
  }

  return result;
};

export const normalize = (path: string): string => {
  const hasTrailingSlash = path && path[path.length - 1] === '/';

  path = normalizeArray(path.split('/')).join('/');

  if (path && hasTrailingSlash) {
    path += '/';
  }

  return `/${path}`;
};

// like `window.encodeURIComponent`, but keep "/" characters intact to improve
// URL readability
export const encodeParts = (path: string): string => {
  return path
    .split('/')
    .map((part) => {
      return window.encodeURIComponent(part);
    })
    .join('/');
};

export const decodeParts = (path: string): string => {
  return path
    .split('/')
    .map((part) => {
      return window.decodeURIComponent(part);
    })
    .join('/');
};
