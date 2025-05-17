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

// Create the Redis client
export const redisClient = new Redis(redisOptions);

// Create PubSub with the same Redis client
export const redisPubSub = new RedisPubSub({
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions),
    connection: redisOptions,
});

// Add connection logging
redisClient.on('connect', () => {
    const address = `${redisOptions.host}:${redisOptions.port}`;
    console.log(`✅ Connected to Redis at ${address}`);
});

redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});

// Test the connection on startup
(async () => {
    try {
        const pong = await redisClient.ping();
        console.log('🏓 Redis ping:', pong);
    } catch (err) {
        console.error('❌ Failed to ping Redis:', err.message);
    }
})();