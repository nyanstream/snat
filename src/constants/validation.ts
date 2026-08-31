import { z } from 'zod';

import { UserRole } from 'src/services/prisma';
import { type UserJwtTokenContent, UserJwtTokenOauthService } from 'src/types/jwt';

const WHITESPACE_CHARS = /^\S*$/;

const TRICKY_CHARS = /^[^\x7F\u202A-\u202E\u202D\u2066-\u2069\u200E\u200F\u061C]*$/;

export const nicknameValidationSchema = z
	.string()
	.trim()
	.nonempty()
	.regex(WHITESPACE_CHARS, 'Whitespace characters are not allowed')
	.regex(TRICKY_CHARS, 'Unacceptable characters')
	.min(1, 'Required')
	.max(20, 'Too long');

export const chatMessageTextValidationSchema = z
	.string()
	.trim()
	.nonempty()
	.regex(TRICKY_CHARS, 'Unacceptable characters')
	.min(1, 'Required')
	.max(500, 'Too long');

export const userJwtTokenContentValidationSchema = z.object({
	userId: z.uuid(),
	nickname: z.string(),
	oauthService: z.enum(UserJwtTokenOauthService).nullable(),
	oauthServiceUserId: z.string().nullable(),
	role: z.enum(UserRole),
	iat: z.number().int(),
	exp: z.number().int(),
}) satisfies z.ZodType<UserJwtTokenContent>;
