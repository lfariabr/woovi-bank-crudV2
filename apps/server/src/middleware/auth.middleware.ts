import { Context } from 'koa';
import { authService } from '../modules/account/auth.service';

export const authenticate = async (ctx: Context, next: () => Promise<any>) => {
  const authHeader = ctx.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // ctx.state.accountId = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const { accountId } = authService.verifyToken(token);
    ctx.state.accountId = accountId;
  } catch (err) {
    console.error('Token verification failed:', err);
    // ctx.state.accountId = null;
  }
  
  await next();
};