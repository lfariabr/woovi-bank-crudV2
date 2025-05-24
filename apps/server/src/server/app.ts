import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'kcors';
import { graphqlHTTP } from 'koa-graphql';
import Router from 'koa-router';
import logger from 'koa-logger';

import { schema } from '../schema/schema';
import { getContext } from './getContext';
import { createWebsocketMiddleware } from './websocketMiddleware';
import { securityHeaders } from '../middleware/securityHeaders';
import { authenticate } from '../middleware/auth.middleware';

const app = new Koa();

app.use(securityHeaders);
app.use(cors({ origin: '*' }));
app.use(logger());
app.use(
	bodyParser({
		onerror(err, ctx) {
			ctx.throw(err, 422);
		},
	})
);

// Custom authentication middleware that bypasses auth for GraphiQL
app.use(async (ctx, next) => {
	// Skip authentication for GraphiQL requests
	if (ctx.path === '/graphql' && ctx.method === 'GET') {
		return next();
	}
	
	// Apply authentication for all other requests
	await authenticate(ctx, next);
});

app.use(createWebsocketMiddleware());

const routes = new Router();

// routes.all('/graphql/ws', wsServer);

routes.all(
	'/graphql',
	graphqlHTTP((req) => ({
		schema,
		graphiql: true,
		context: getContext({ req }),
	}))
);

app.use(routes.routes());
app.use(routes.allowedMethods());

export { app };
