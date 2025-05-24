import { Context, Next } from 'koa';

export const securityHeaders = async (ctx: Context, next: Next) => {
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.set('X-Frame-Options', 'DENY');
  ctx.set('X-XSS-Protection', '1; mode=block');
  ctx.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Temporary fix to allow GraphiQL to work, in alternative to Apollo Server /apollo_graphql_setup.md 
  if (ctx.path === '/graphql' && ctx.method === 'GET') {
    ctx.set('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';");
  } else {
    ctx.set('Content-Security-Policy', "default-src 'self'");
  }
  
  ctx.set('Referrer-Policy', 'no-referrer');
  
  await next();
};