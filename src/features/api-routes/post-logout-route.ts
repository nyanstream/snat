import { z } from 'zod';

import { UnauthorizedError } from 'src/constants/error';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

// route for logout

export const apiPostLogoutRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.post(
		routes.apiPostLogout,

		async ctx => {
			const userInfo = ctx.currentChatUser;
			if (!userInfo) {
				ctx.set.status = 401;
				throw new UnauthorizedError();
			}

			ctx.chatUsersStorage.removeUser(ctx.headers.authorization);
			ctx.chatEventListener.dispatchUserLogout(userInfo.tokenContent.userId);

			return { success: true };
		},

		{
			detail: { tags: ['api'] },
			headers: z.object({
				authorization: z.jwt(),
			}),
			response: {
				200: z.object({
					success: z.boolean(),
				}),
			},
		},
	);
};
