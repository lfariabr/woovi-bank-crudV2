// src/server/getContext.ts
import { getDataloaders } from '../modules/loader/loaderRegister';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const getContext = ({ req = {} } = {}) => {
	const JWT_SECRET = process.env.JWT_SECRET!;
	if (!JWT_SECRET) {
		console.error('JWT_SECRET is not set. Double check .env.');
	}
	
  let accountId: string | undefined;
  const authHeader = req?.headers?.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { accountId: string };
      accountId = decoded.accountId;
    } catch (error) {
      console.error('Token error:', error);
    }
  }

  return {
    accountId,
    dataloaders: getDataloaders(),
  };
};

export { getContext };