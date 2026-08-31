import { z } from 'zod';

import { ChatMessageType, UserRole } from 'src/services/prisma';

import { ChatUserStatus } from './chatUser';

export const CHAT_USER_API_SCHEMA = z.object({
	id: z.uuid(),
	nickname: z.string(),
	role: z.enum(UserRole),
	status: z.enum(ChatUserStatus),
});

export const CHAT_MESSAGE_API_SCHEMA = z.object({
	id: z.uuid(),
	createdAt: z.iso.datetime(),
	userId: z.uuid().nullable(),
	nickname: z.string(),
	text: z.string(),
	type: z.enum(ChatMessageType),
});

export const EMOJI_API_SCHEMA = z.object({
	id: z.uuid(),
	code: z.string(),
	imageUrl: z.url(),
	imageWidth: z.int().min(1),
	imageHeight: z.int().min(1),
	uiHidden: z.boolean(),
	uiColorInverted: z.boolean(),
	uiReversedX: z.boolean(),
});
