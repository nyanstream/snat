import { z } from 'zod';

import { UnauthorizedError } from 'src/constants/error';
import { routes } from 'src/constants/routes';
import { chatMessageTextValidationSchema } from 'src/constants/validation';
import type { ElysiaInstance } from 'src/instance';
import { UserRole } from 'src/services/prisma';

// route to post new messages to the chat

export const apiPostSendChatMessageRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.post(
		routes.apiPostSendChatMessage,

		async ctx => {
			const user = ctx.chatUsersStorage.getUserByToken(ctx.headers.authorization);
			if (!user) {
				ctx.set.status = 401;
				throw new UnauthorizedError();
			}

			const userId = user.tokenContent.role !== UserRole.Guest ? user.tokenContent.userId : undefined;

			const messages = await ctx.db.chatMessage.create({
				data: {
					nickname: user.tokenContent.nickname,
					text: ctx.body.text,
					userId,
					ipV4: ctx.requestIp,
				},
				select: { id: true },
			});

			ctx.chatEventListener.dispatchNewChatMessage(messages.id);

			return { id: messages.id };
		},

		{
			detail: { tags: ['api'] },
			headers: z.object({
				authorization: z.jwt(),
			}),
			body: z.object({
				text: chatMessageTextValidationSchema,
			}),
			response: {
				200: z.object({
					id: z.uuid(),
				}),
			},
		},
	);
};
