import { config } from './config';
import { routes } from './constants/routes';
import { apiRoutes } from './features/api-routes/api-routes';
import { oauthRoutes } from './features/oauth-routes/oauth-routes';
import { sseRoute } from './features/sse-routes/sse-route';
import { staticRoutes } from './features/static-routes/static-routes';
import { elysiaInstance } from './instance';

elysiaInstance.use(apiRoutes).use(oauthRoutes).use(sseRoute).use(staticRoutes);

if (config.SWAGGER_ENABLED) {
	const openapi = await import('@elysiajs/openapi');
	const zod = await import('zod');
	const { version } = await import('../package.json');

	elysiaInstance.use(
		openapi.openapi({
			path: routes.apiDocs,
			mapJsonSchema: {
				zod: zod.toJSONSchema,
			},
			exclude: {
				tags: ['docs-hidden', 'static'],
			},
			documentation: {
				info: {
					title: 'Snat API',
					version,
				},
			},
			scalar: {
				cdn: 'https://cdnjs.cloudflare.com/ajax/libs/scalar-api-reference/1.34.6/standalone.min.js',
			},
		}),
	);
}

try {
	const SERVER_URL = new URL(config.INTERNAL_SERVER_URL);

	elysiaInstance.listen({
		port: SERVER_URL.port,
		hostname: SERVER_URL.hostname,
	});
} catch (error) {
	console.error('Failed to start server:', error);
	process.exit(1);
}
