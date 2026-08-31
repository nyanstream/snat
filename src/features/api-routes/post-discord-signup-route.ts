import { z } from 'zod';

import { CHAT_USER_API_SCHEMA } from 'src/constants/api-schemas';
import { routes } from 'src/constants/routes';
import { nicknameValidationSchema } from 'src/constants/validation';
import type { ElysiaInstance } from 'src/instance';
import { UserRole, UserStatus } from 'src/services/prisma';
import type { UserJwtTokenContent } from 'src/types/jwt';

// route to signup users via Discord

export const apiPostDiscordSignupRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.post(
		routes.apiPostDiscordSignup,

		async ctx => {
			const session = ctx.oauthSessionsStorage.getSession(ctx.body.oauthSessionId);

			if (!session) {
				ctx.set.status = 400;
				throw new Error('Invalid session id');
			}

			const { connectionId, nickname } = ctx.body;

			const existingUser = await ctx.db.user.findUnique({
				where: { nickname },
				select: { id: true },
			});
			const existingStorageUser = ctx.chatUsersStorage.findUserByNickname(nickname);

			if (existingUser || existingStorageUser) {
				ctx.set.status = 400;
				throw new Error('Nickname is already taken. Try another one (you can change it later)');
			}

			const isConnectionExists = ctx.chatEventListener.checkIsConnectionExists(connectionId);

			if (!isConnectionExists) {
				ctx.set.status = 400;
				throw new Error('Connection not found');
			}

			const user = await ctx.db.user.create({
				data: {
					nickname,
					discordUserId: session.serviceUserId,
					role: UserRole.User,
					status: UserStatus.Active,
				},
				select: { id: true },
			});

			const now = Math.floor(Date.now() / 1000);
			const expiresIn = 86_400; // one day in seconds

			const userJwtTokenContent: UserJwtTokenContent = {
				userId: user.id,
				nickname,
				oauthService: 'discord',
				oauthServiceUserId: session.serviceUserId,
				role: UserRole.User,
				iat: now,
				exp: now + expiresIn,
			};

			const chatUser = ctx.chatUsersStorage.addUser(connectionId, userJwtTokenContent);

			ctx.oauthSessionsStorage.removeSession(ctx.body.oauthSessionId);
			ctx.chatEventListener.dispatchUserLogin(user.id);

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
				oauthSessionId: z.uuid(),
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
