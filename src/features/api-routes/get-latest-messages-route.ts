import { z } from 'zod';

import { CHAT_MESSAGE_API_SCHEMA } from 'src/constants/api-schemas';
import { ChatMessageSelect, DEFAULT_NICKNAME_MAP } from 'src/constants/chatMessage';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

// route to get latest chat messages

export const apiGetLatestMessagesRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.get(
		routes.apiGetLatestMessages,

		async ctx => {
			const messages = await ctx.db.chatMessage.findMany({
				take: 100,
				orderBy: { createdAt: 'desc' },
				select: ChatMessageSelect,
			});

			return messages.toReversed().map(message => ({
				id: message.id,
				createdAt: message.createdAt.toISOString(),
				userId: message.user?.id || null,
				nickname: message.user?.nickname || message.nickname || DEFAULT_NICKNAME_MAP[message.type],
				text: message.text,
				type: message.type,
			}));
		},

		{
			detail: { tags: ['api'] },
			response: {
				200: z.array(CHAT_MESSAGE_API_SCHEMA),
			},
		},
	);
};
