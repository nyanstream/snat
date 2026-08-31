import { z } from 'zod';

import { UnauthorizedError } from 'src/constants/error';
import { CHAT_MODERATION_ROLES } from 'src/constants/role';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';
import { UserRole } from 'src/services/prisma';

// route to delete chat messages

export const apiDeleteChatMessageRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.delete(
		routes.apiDeleteChatMessage,

		async ctx => {
			const userInfo = ctx.currentChatUser;
			if (!userInfo || (userInfo && !CHAT_MODERATION_ROLES.includes(userInfo.tokenContent.role))) {
				ctx.set.status = 401;
				throw new UnauthorizedError();
			}

			const message = await ctx.db.chatMessage.findUnique({
				where: { id: ctx.body.messageId },
				select: {
					ipV4: true,
					user: {
						select: {
							role: true,
						},
					},
				},
			});

			if (!message || !message.ipV4) {
				ctx.set.status = 400;
				throw new Error('Message not found');
			}

			if (userInfo.tokenContent.role !== UserRole.Administrator && message.user?.role === UserRole.Administrator) {
				ctx.set.status = 403;
				throw new Error('Unable to delete message');
			}

			if (ctx.body.banUserByIp) {
				ctx.bannedIpStorage.add(message.ipV4);

				const connections = ctx.chatEventListener.findConnectionsByIpV4(message.ipV4);
				for (const connection of connections) {
					const user = ctx.chatUsersStorage.findUserByConnectionId(connection[0]);
					if (user) {
						ctx.chatUsersStorage.removeUser(user[0]);
						ctx.chatEventListener.dispatchUserLogout(user[1].tokenContent.userId);
					}

					ctx.chatEventListener.dispatchConnectionClose(connection[0]);
					ctx.chatEventListener.unsubscribe({ connectionId: connection[0] });
				}
			}

			const messages = await ctx.db.chatMessage.findMany({
				where: ctx.body.removeAllMessagesByIp ? { ipV4: { equals: message.ipV4 } } : { id: ctx.body.messageId },
				take: ctx.body.removeAllMessagesByIp ? undefined : 1,
				select: { id: true },
			});
			const messagesIdList = messages.map(message => message.id);

			await ctx.db.chatMessage.deleteMany({
				where: { id: { in: messagesIdList } },
			});

			ctx.chatEventListener.dispatchMessagesDeleted(messagesIdList);

			return { success: true };
		},

		{
			detail: { tags: ['api'] },
			headers: z.object({ authorization: z.jwt() }),
			body: z.object({
				messageId: z.uuid(),
				banUserByIp: z.boolean().optional().default(false),
				removeAllMessagesByIp: z.boolean().optional().default(false),
			}),
			response: {
				200: z.object({ success: z.boolean() }),
			},
		},
	);
};
