import { Elysia } from 'elysia';

import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

export const staticRoutes = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.use(
		new Elysia({ name: 'static', detail: { tags: ['static'] } })
			.get(
				routes.index,
				req => {
					req.set.status = 403;
					req.set.headers['Content-Type'] = 'text/html';
					return Bun.file('./public/index.html').text();
				},
				{ detail: { hide: true } },
			)
			.get(
				routes.chat,
				req => {
					req.set.headers['Content-Type'] = 'text/html';
					return Bun.file('./public/chat.html').text();
				},
				{ detail: { hide: true } },
			),
	);
};
