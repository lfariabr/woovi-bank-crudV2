import path from 'path';

import dotenvSafe from 'dotenv-safe';

const cwd = process.cwd();

const root = path.join.bind(cwd);

dotenvSafe.config({
	path: root('.env'),
	sample: root('.env.example'),
});

const ENV = process.env;

const config = {
	PORT: ENV.PORT ?? 4000,
	MONGO_URI: ENV.MONGO_URI ?? '',
	JWT_SECRET: ENV.JWT_SECRET ?? '',
};

if (!config.JWT_SECRET) {
	throw new Error('JWT_SECRET is not defined in .env');
  }

export { config };
