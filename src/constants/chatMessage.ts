import { ChatMessageType, type Prisma } from 'src/services/prisma';

export const ChatMessageSelect = {
	id: true,
	createdAt: true,
	nickname: true,
	text: true,
	type: true,
	user: {
		select: {
			id: true,
			nickname: true,
		},
	},
} satisfies Prisma.ChatMessageSelect;

export type ChatMessageFragment = Prisma.ChatMessageGetPayload<{
	select: typeof ChatMessageSelect;
}>;

export const DEFAULT_NICKNAME_MAP = {
	[ChatMessageType.System]: 'System',
	[ChatMessageType.User]: 'Guest',
} as const;
