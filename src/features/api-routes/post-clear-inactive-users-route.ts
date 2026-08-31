import { z } from 'zod';

import { config } from 'src/config';
import { ChatUserStatus } from 'src/constants/chatUser';
import { UnauthorizedError } from 'src/constants/error';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

// route to clear inactive users (for cron)

export const apiPostClearInactiveUsersRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.post(
		routes.apiPostClearInactiveUsers,

		async ctx => {
			if (ctx.body.MASTER_TOKEN !== config.MASTER_TOKEN) {
				ctx.set.status = 401;
				throw new UnauthorizedError();
			}

			const users = ctx.chatUsersStorage.getUsers();

			const inactiveUsers = Object.entries(users).filter(
				user => user[1].status === ChatUserStatus.inactive || user[1].tokenContent.exp < Date.now() / 1000,
			);

			const expiredOauthSessions = ctx.oauthSessionsStorage.getExpiredSessions();

			for (const [token, user] of inactiveUsers) {
				const userId = user.tokenContent.userId;
				ctx.chatUsersStorage.removeUser(token);
				ctx.chatEventListener.dispatchUserLogout(userId);
			}

			for (const [sessionId] of expiredOauthSessions) {
				ctx.oauthSessionsStorage.removeSession(sessionId);
			}

			return { success: true };
		},

		{
			detail: { tags: ['api'], hide: true },
			body: z.object({
				MASTER_TOKEN: z.string().nonempty(),
			}),
			response: {
				200: z.object({
					success: z.boolean(),
				}),
			},
		},
	);
};
