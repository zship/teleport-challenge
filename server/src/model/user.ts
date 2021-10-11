export type Scope = 'read:filebrowser' | 'write: dummy';

export type User = {
  username: string;
  scopes: Scope[];
  passwordHash: string;
  salt: string;
};

const userStore: User[] = [
  {
    username: 'zach',
    salt: '3d0c831c31a698b94035c2a3d667687d',
    passwordHash:
      'd4864bf0dbafd4cd67f7fa7a874a6abb84aeb855ee4b18fb7ba88683a83d81a0',
    scopes: ['read:filebrowser'],
  },
];

export const getByUsername = (username: string): User | undefined => {
  const result = userStore.filter((user) => {
    return user.username === username;
  });
  if (result.length === 1) {
    return result[0];
  }
  if (result.length > 1) {
    // would never happen in a database with UNIQUE constraint
    throw new Error(`Multiple users found matching username ${username}`);
  }
  return undefined;
};
