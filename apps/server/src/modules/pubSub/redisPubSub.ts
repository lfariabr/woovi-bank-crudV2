import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisOptions = {
    host: '127.0.0.1',
    port: 6381,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 5000);
        console.log(`🔁 Redis reconnecting in ${delay}ms...`);
        return delay;
    },
    reconnectOnError: (err: Error) => {
        console.error('🔴 Redis connection error:', err.message);
        return true; // Reconnect on error
    }
};

// Create the Redis client and PubSub instance
export const redisClient = new Redis(redisOptions);
export const redisPubSub = new RedisPubSub({
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions),
    connection: redisOptions,
});

redisClient.on('connect', () => {
    const address = `${redisOptions.host}:${redisOptions.port}`;
});

redisClient.on('ready', () => {
});

redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});