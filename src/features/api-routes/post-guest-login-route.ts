import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { CHAT_USER_API_SCHEMA } from 'src/constants/api-schemas';
import { routes } from 'src/constants/routes';
import { nicknameValidationSchema } from 'src/constants/validation';
import type { ElysiaInstance } from 'src/instance';
import { UserRole } from 'src/services/prisma';
import type { UserJwtTokenContent } from 'src/types/jwt';

// route to login guest users in the chat

export const apiPostGuestLoginRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.post(
		routes.apiPostGuestLogin,

		async ctx => {
			if (ctx.bannedIpStorage.has(ctx.requestIp)) {
				ctx.set.status = 403;
				throw new Error('User blocked');
			}

			const { connectionId, nickname } = ctx.body;

			const existingUser = await ctx.db.user.findUnique({
				where: { nickname },
				select: { id: true },
			});
			const existingStorageUser = ctx.chatUsersStorage.findUserByNickname(nickname);

			if (existingUser || existingStorageUser) {
				ctx.set.status = 400;
				throw new Error('Nickname is already taken. Try another one');
			}

			const isConnectionExists = ctx.chatEventListener.checkIsConnectionExists(connectionId);

			if (!isConnectionExists) {
				ctx.set.status = 400;
				throw new Error('Connection not found');
			}

			const userId = randomUUID();

			const now = Math.floor(Date.now() / 1000);
			const expiresIn = 86_400; // one day in seconds

			const userJwtTokenContent: UserJwtTokenContent = {
				userId,
				nickname,
				oauthService: null,
				oauthServiceUserId: null,
				role: UserRole.Guest,
				iat: now,
				exp: now + expiresIn,
			};

			const chatUser = ctx.chatUsersStorage.addUser(connectionId, userJwtTokenContent);

			ctx.chatEventListener.dispatchUserLogin(chatUser[1].tokenContent.userId);

			return {
				bearer: chatUser[0],
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
			body: z.object({
				connectionId: z.uuid(),
				nickname: nicknameValidationSchema,
			}),
			response: {
				200: z.object({
					bearer: z.jwt(),
					user: CHAT_USER_API_SCHEMA,
				}),
			},
		},
	);
};
