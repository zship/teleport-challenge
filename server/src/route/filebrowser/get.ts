import { makeRequestHandler } from 'server/lib/makeRequestHandler';
import { assertAuthorized } from 'server/model/session';

export const handleGetFilebrowser = makeRequestHandler((req, res) => {
  assertAuthorized(req, ['read:filebrowser']);

  res.status(200).send('stub');
});
