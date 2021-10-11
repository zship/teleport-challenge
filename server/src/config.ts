import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

const port = process.env.PORT || 8443;

let sslKeyPath = process.env.SSL_KEY_PATH || '.keys/server-key.pem';
let sslCertPath = process.env.SSL_CERT_PATH || '.keys/server-cert.pem';
let clientPath = process.env.CLIENT_PATH || '../client/build';
let fileBrowserRoot = process.env.FILEBROWSER_ROOT || '../client';

sslKeyPath = path.resolve(projectRoot, sslKeyPath);
sslCertPath = path.resolve(projectRoot, sslCertPath);
clientPath = path.resolve(projectRoot, clientPath);
fileBrowserRoot = path.resolve(projectRoot, fileBrowserRoot);

export const config = {
  port,
  sslKeyPath,
  sslCertPath,
  clientPath,
  fileBrowserRoot,
};
