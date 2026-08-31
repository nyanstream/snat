export const ChatUserStatus = {
	active: 'active',
	inactive: 'inactive',
	afk: 'afk',
} as const;

export type ChatUserStatus = (typeof ChatUserStatus)[keyof typeof ChatUserStatus];
