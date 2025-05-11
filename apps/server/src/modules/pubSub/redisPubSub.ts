import { RedisPubSub } from 'graphql-redis-subscriptions';
import dotenv from 'dotenv';
dotenv.config();

export const redisPubSub = new RedisPubSub({
	connection: process.env.REDIS_HOST,
});
