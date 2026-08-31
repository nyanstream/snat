import { sign, verify } from 'jsonwebtoken';

import { config } from 'src/config';
import { userJwtTokenContentValidationSchema } from 'src/constants/validation';
import type { UserJwtTokenContent } from 'src/types/jwt';

export const generateUserJwtToken = (
	content: Omit<UserJwtTokenContent, 'iat' | 'exp'>,
	expiresIn = 86_400, // one day in seconds
) => {
	const now = Math.floor(Date.now() / 1000);

	return sign(
		{
			...content,
			iat: now,
			exp: now + expiresIn,
		},
		config.JWT_SECRET,
	);
};

export const decodeUserJwtToken = (token: string): UserJwtTokenContent | null => {
	const decodedData = verify(token, config.JWT_SECRET);
	if (!decodedData) {
		return null;
	}

	return userJwtTokenContentValidationSchema.parse(decodedData);
};
