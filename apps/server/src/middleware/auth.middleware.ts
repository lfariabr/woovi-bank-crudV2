import { Context } from 'koa';
import { authService } from '../modules/account/auth.service';

export const authenticate = async (ctx: Context, next: () => Promise<any>) => {
  const authHeader = ctx.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header or invalid format');
    return next();
  }
  const token = authHeader.split(' ')[1];
  // console.log('Token received:', token);

  const isBlacklisted = await authService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    console.log('Token has been invalidated');
    ctx.throw(401, 'Sorry, your token has expired');
  }
  
  try {
    const { accountId } = authService.verifyToken(token);
    // console.log('Token verified successfully for accountId:', accountId);
    ctx.state.accountId = accountId;
  } catch (err) {
    console.error('Token verification failed:', err);
    ctx.throw(401, 'Invalid token');
  }
  
  await next();
};