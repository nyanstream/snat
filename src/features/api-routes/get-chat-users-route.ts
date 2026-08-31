import { z } from 'zod';

import { CHAT_USER_API_SCHEMA } from 'src/constants/api-schemas';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

// route to get chat users

export const apiGetChatUsersRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.get(
		routes.apiGetChatUsers,

		async ctx => {
			const connections = ctx.chatEventListener.getConnectionsIdList();

			const users = Object.values(ctx.chatUsersStorage.getUsers()).map(item => ({
				id: item.tokenContent.userId,
				nickname: item.tokenContent.nickname,
				role: item.tokenContent.role,
				status: item.status,
			}));

			return {
				connectionsCount: connections.length,
				users,
			};
		},

		{
			detail: { tags: ['api'] },
			response: {
				200: z.object({
					connectionsCount: z.int().min(0),
					users: z.array(CHAT_USER_API_SCHEMA),
				}),
			},
		},
	);
};
