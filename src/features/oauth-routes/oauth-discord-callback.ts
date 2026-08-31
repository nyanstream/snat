import { z } from 'zod';

import { config } from 'src/config';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';
import { generateUserJwtToken } from 'src/utils/jwt';

export const oauthDiscordCallbackRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.get(
		routes.oauthDiscordCallback,

		async ctx => {
			if (ctx.bannedIpStorage.has(ctx.requestIp)) {
				ctx.set.status = 403;
				throw new Error('User blocked');
			}

			const authTokenRequest = await fetch('https://discord.com/api/oauth2/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					client_id: config.DISCORD_CLIENT_ID,
					client_secret: config.DISCORD_CLIENT_SECRET,
					grant_type: 'authorization_code',
					code: ctx.query.code,
					redirect_uri: new URL(routes.oauthDiscordCallback, config.PUBLIC_SERVER_URL).href,
				}),
			});

			const authTokenResponseRaw = await authTokenRequest.json();
			const authTokenResponse = discordOauthTokenResponseSchema.safeParse(authTokenResponseRaw);

			if (!authTokenResponse.success) {
				ctx.set.status = 500;
				throw new Error('Failed to get Discord auth token');
			}

			const userInfoRequest = await fetch('https://discord.com/api/users/@me', {
				headers: {
					Authorization: `${authTokenResponse.data.token_type} ${authTokenResponse.data.access_token}`,
				},
			});

			const userInfoResponseRaw = await userInfoRequest.json();
			const userInfoResponse = discordUserResponseSchema.safeParse(userInfoResponseRaw);

			if (!userInfoResponse.success) {
				ctx.set.status = 500;
				throw new Error('Failed to get Discord user data');
			}

			const user = await ctx.db.user.findUnique({
				where: { discordUserId: userInfoResponse.data.id },
				select: {
					id: true,
					nickname: true,
					role: true,
				},
			});

			if (user) {
				const userJwtToken = generateUserJwtToken({
					userId: user.id,
					nickname: user.nickname,
					oauthService: 'discord',
					oauthServiceUserId: userInfoResponse.data.id,
					role: user.role,
				});

				const redirectUrl = `${config.PUBLIC_CLIENT_URL}#bearerToken=${userJwtToken}`;

				return ctx.redirect(redirectUrl);
			}

			const [sessionId] = ctx.oauthSessionsStorage.addSession(userInfoResponse.data.id);

			const redirectUrl = `${config.PUBLIC_CLIENT_URL}#oauthSessionId=${sessionId}`;

			return ctx.redirect(redirectUrl);
		},

		{
			detail: { tags: ['oauth'], hide: true },
			query: z.object({
				code: z.string(),
			}),
		},
	);
};

const discordOauthTokenResponseSchema = z.object({
	access_token: z.string().nonempty(),
	token_type: z.string().nonempty(),
	expires_in: z.number().int(),
	refresh_token: z.string().nonempty(),
	scope: z.string().nonempty(),
});

const discordUserResponseSchema = z.object({
	id: z.string().nonempty(),
	username: z.string().nonempty(),
});
