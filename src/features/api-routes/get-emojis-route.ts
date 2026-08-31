import { z } from 'zod';

import { EMOJI_API_SCHEMA } from 'src/constants/api-schemas';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';

// route to get emojis

export const apiGetEmojisRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.get(
		routes.apiGetEmojis,

		async ctx => {
			const emojis = await ctx.db.emoji.findMany({
				orderBy: { priorityOrder: 'desc' },
			});

			return emojis;
		},

		{
			detail: { tags: ['api'] },
			response: {
				200: z.array(EMOJI_API_SCHEMA),
			},
		},
	);
};
