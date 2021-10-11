import fs from 'fs/promises';
import path from 'path';

import { ErrorWithCode } from 'server/lib/ErrorWithCode';

import { config } from 'server/config';
const { fileBrowserRoot } = config;

type Entry = {
  name: string;
  type: 'file' | 'directory';
  size: number;
};

// node.js throws `Error`s with several additional properties added, such as
// `code`. These properties are specified in the `NodeJS.ErrnoException`
// interface, but the errors thrown by node.js are still `instanceof Error`.
// This function supplies type narrowing to allow access to those additional
// properties.
const isNodeJsError = (err: unknown): err is NodeJS.ErrnoException => {
  if (typeof err !== 'object') {
    return false;
  }
  if (err === null) {
    return false;
  }
  if ('code' in err) {
    return true;
  }
  return false;
};

export const readdir = async (rawPath: string): Promise<Entry[]> => {
  let absolutePath = path.join(fileBrowserRoot, rawPath);
  absolutePath = path.normalize(absolutePath);

  // fail fast if `rawPath` lies outside `fileBrowserRoot` (e.g. it has '..'
  // components)
  const relativePath = path.relative(fileBrowserRoot, absolutePath);
  if (relativePath.startsWith('..')) {
    throw new ErrorWithCode({
      code: 'filebrowser/noEntry',
      message: `The file "${rawPath}" does not exist.`,
    });
  }

  const result: Entry[] = [];
  let files: string[] = [];

  try {
    files = await fs.readdir(absolutePath);
  } catch (err) {
    if (isNodeJsError(err)) {
      if (err.code === 'ENOENT') {
        throw new ErrorWithCode({
          code: 'filebrowser/noEntry',
          message: `The file "${rawPath}" does not exist.`,
        });
      } else if (err.code === 'ENOTDIR') {
        throw new ErrorWithCode({
          code: 'filebrowser/notDirectory',
          message: `The file "${rawPath}" is not a directory.`,
        });
      }
    }
    throw err;
  }

  for (const file of files) {
    const stats = await fs.stat(path.join(absolutePath, file));
    const type = stats.isDirectory() ? 'directory' : 'file';
    result.push({
      name: file,
      type,
      size: stats.size,
    });
  }

  return result;
};
