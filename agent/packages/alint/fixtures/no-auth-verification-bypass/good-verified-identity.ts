import { jwtVerify } from 'jose';

import { deleteAccount, signingKey } from './accounts';

export const removeAccount = async (input: { token: string }) => {
  const { payload } = await jwtVerify(input.token, signingKey, {
    audience: 'mcit',
    issuer: 'auth',
  });
  if (!payload.sub) throw new Error('Missing subject');
  return deleteAccount(payload.sub);
};
