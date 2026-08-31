import { z } from 'zod';

import { CHAT_USER_API_SCHEMA } from 'src/constants/api-schemas';
import { UnauthorizedError } from 'src/constants/error';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';
import { decodeUserJwtToken } from 'src/utils/jwt';

// route to auth user with existing token

export const apiPostLoginWithTokenRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.post(
		routes.apiPostLoginWithToken,

		async ctx => {
			const tokenContent = decodeUserJwtToken(ctx.headers.authorization);
			if (!tokenContent) {
				ctx.set.status = 401;
				throw new UnauthorizedError();
			}

			if (tokenContent.exp < Date.now() / 1000) {
				ctx.set.status = 401;
				throw new Error('Token expired');
			}

			const { connectionId } = ctx.body;

			const isConnectionExists = ctx.chatEventListener.checkIsConnectionExists(connectionId);

			if (!isConnectionExists) {
				ctx.set.status = 400;
				throw new Error('Connection not found');
			}

			await ctx.db.user.updateMany({
				where: { id: tokenContent.userId },
				data: { lastOnlineAt: new Date() },
			});

			const chatUser = ctx.chatUsersStorage.addUser(connectionId, ctx.headers.authorization);

			ctx.chatEventListener.dispatchUserLogin(tokenContent.userId);

			return {
				user: {
					id: chatUser[1].tokenContent.userId,
					nickname: chatUser[1].tokenContent.nickname,
					role: chatUser[1].tokenContent.role,
					status: chatUser[1].status,
				},
			};
		},

		{
			detail: { tags: ['api'] },
			headers: z.object({
				authorization: z.jwt(),
			}),
			body: z.object({
				connectionId: z.uuid(),
			}),
			response: {
				200: z.object({
					user: CHAT_USER_API_SCHEMA,
				}),
			},
		},
	);
};
