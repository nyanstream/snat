import type { UserRole } from 'src/services/prisma';

export const UserJwtTokenOauthService = {
	discord: 'discord',
} as const;
export type UserJwtTokenOauthService = (typeof UserJwtTokenOauthService)[keyof typeof UserJwtTokenOauthService];

export type UserJwtTokenContent = {
	userId: string;
	nickname: string;
	oauthService: UserJwtTokenOauthService | null;
	oauthServiceUserId: string | null;
	role: UserRole;
	iat: number;
	exp: number;
};
