import type { ElysiaInstance } from 'src/instance';

import { oauthDiscordCallbackRoute } from './oauth-discord-callback';

export const oauthRoutes = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.use(oauthDiscordCallbackRoute);
};
