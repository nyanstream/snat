import { z } from 'zod';

import { config } from 'src/config';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

// route to get Discord OAuth URL

export const apiGetDiscordOauthUrlRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.get(
		routes.apiGetDiscordOauthUrl,

		async () => {
			const oauthCallbackUrl = new URL(routes.oauthDiscordCallback, config.PUBLIC_SERVER_URL).href;
			const url = `https://discord.com/oauth2/authorize?client_id=${config.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(oauthCallbackUrl)}&scope=identify`;

			return { url };
		},

		{
			detail: { tags: ['api'] },
			response: {
				200: z.object({ url: z.url() }),
			},
		},
	);
};
