import { scrypt } from 'crypto';

export const getPasswordHash = ({
  password,
  salt,
}: {
  password: string;
  salt: Buffer;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      256 / 8,
      {
        N: 2 ** 14,
        r: 8,
        p: 4,
      },
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derivedKey.toString('hex'));
      },
    );
  });
};
