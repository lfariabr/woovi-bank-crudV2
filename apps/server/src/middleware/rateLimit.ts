// src/middleware/rateLimit.ts

// TODO: Install rate-limiter-flexible

import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisClient } from '../modules/pubSub/redisPubSub';
import { Context, Next } from 'koa';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limit',
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
  blockDuration: 60 * 15 // Block for 15 minutes if limit is exceeded
});

export const rateLimit = async (ctx: Context, next: Next) => {
  try {
    const ip = ctx.ip || 'unknown';
    await rateLimiter.consume(ip);
    await next();
  } catch (err) {
    ctx.status = 429;
    ctx.body = { error: 'Too Many Requests' };
  }
};

// // In app.ts
// import { rateLimit } from './middleware/rateLimit';
// app.use(rateLimit);