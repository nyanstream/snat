import { z } from 'zod';

import { CHAT_USER_API_SCHEMA } from 'src/constants/api-schemas';
import { UnauthorizedError } from 'src/constants/error';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

// route to get chat current user

export const apiGetCurrentChatUserRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.get(
		routes.apiGetCurrentChatUser,

		async ctx => {
			const userInfo = ctx.currentChatUser;
			if (!userInfo) {
				ctx.set.status = 401;
				throw new UnauthorizedError();
			}

			return {
				id: userInfo.tokenContent.userId,
				nickname: userInfo.tokenContent.nickname,
				role: userInfo.tokenContent.role,
				status: userInfo.status,
			};
		},

		{
			detail: { tags: ['api'] },
			headers: z.object({ authorization: z.jwt() }),
			response: {
				200: CHAT_USER_API_SCHEMA,
			},
		},
	);
};
