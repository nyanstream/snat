import { randomUUID } from 'node:crypto';
import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';

import { config } from './config';
import { ChatEventListener } from './services/chat-event-listener';
import { ChatUsersStorage } from './services/chat-users-storage';
import { resolveBaseLogger } from './services/logger';
import { OauthSessionsStorage } from './services/oauth-sessions-storage';
import { resolveDb } from './services/prisma/resolveDb';

const tlsCert = config.SERVER_TLS_CERT_PATH ? Bun.file(config.SERVER_TLS_CERT_PATH) : null;
const tlsKey = config.SERVER_TLS_KEY_PATH ? Bun.file(config.SERVER_TLS_KEY_PATH) : null;

const createElysiaInstance = () => {
	const logger = resolveBaseLogger();

	return new Elysia({
		serve: {
			...(tlsCert && tlsKey
				? {
						tls: {
							cert: tlsCert,
							key: tlsKey,
						},
					}
				: {}),
		},
	})
		.use(
			cors({
				origin: ['https://nyan.stream', /.*\.nyan\.stream$/, /(localhost)/],
			}),
		)
		.decorate('db', resolveDb(logger.child({ service: 'db' })))
		.decorate('chatUsersStorage', new ChatUsersStorage())
		.decorate('chatEventListener', new ChatEventListener())
		.decorate('bannedIpStorage', new Set<string>())
		.decorate('oauthSessionsStorage', new OauthSessionsStorage())
		.derive(ctx => {
			const requestIp = ctx.server?.requestIP(ctx.request)?.address;
			if (!requestIp) {
				ctx.set.status = 400;
				throw new Error('IP address not found');
			}
			return { requestIp };
		})
		.onRequest(ctx => {
			ctx.set.headers['x-request-id'] = randomUUID();
		})
		.derive(ctx => {
			return { requestId: ctx.set.headers['x-request-id'] };
		})
		.derive(ctx => {
			const currentChatUser = ctx.headers.authorization
				? ctx.chatUsersStorage.getUserByToken(ctx.headers.authorization)
				: undefined;
			return { currentChatUser };
		})
		.derive(ctx => {
			const requestLogger = logger.child({
				requestId: ctx.requestId,
				caller: ctx.currentChatUser ? ctx.currentChatUser.tokenContent.userId : ctx.requestIp,
			});
			requestLogger.debug({ url: ctx.request.url });

			return { logger: requestLogger };
		});
};

export const elysiaInstance = createElysiaInstance();

export type ElysiaInstance = typeof elysiaInstance;
