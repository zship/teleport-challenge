import { randomBytes } from 'crypto';
import readline from 'readline';
import { getPasswordHash } from 'server/lib/auth';

const main = async (): Promise<void> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  };

  const username = await question('Username: ');
  const password = await question('Password: ');
  const salt = randomBytes(128 / 8);
  const passwordHash = await getPasswordHash({ password, salt });
  console.log({
    username,
    salt: salt.toString('hex'),
    passwordHash,
    scopes: ['read:filebrowser'],
  });

  rl.close();
};

void main();
