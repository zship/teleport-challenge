import { makeRequestHandler } from 'server/lib/makeRequestHandler';
import { assertAuthorized } from 'server/model/session';
import { readdir } from 'server/model/filebrowser';

export const handleGetFilebrowser = makeRequestHandler(async (req, res) => {
  assertAuthorized(req, ['read:filebrowser']);

  let filepath = req.params[0] || '';
  filepath = decodeURIComponent(filepath);

  const entries = await readdir(filepath);
  res.status(200).send(JSON.stringify(entries));
});
