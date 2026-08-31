import type { ElysiaInstance } from 'src/instance';

import { apiDeleteChatMessageRoute } from './delete-chat-messages';
import { apiGetChatUsersRoute } from './get-chat-users-route';
import { apiGetCurrentChatUserRoute } from './get-current-chat-user-route';
import { apiGetDiscordOauthUrlRoute } from './get-discord-oauth-url-route';
import { apiGetEmojisRoute } from './get-emojis-route';
import { apiGetLatestMessagesRoute } from './get-latest-messages-route';
import { apiPostClearInactiveUsersRoute } from './post-clear-inactive-users-route';
import { apiPostDiscordSignupRoute } from './post-discord-signup-route';
import { apiPostGuestLoginRoute } from './post-guest-login-route';
import { apiPostLoginWithTokenRoute } from './post-login-with-token-route';
import { apiPostLogoutRoute } from './post-logout-route';
import { apiPostSendChatMessageRoute } from './post-send-chat-message-route';

export const apiRoutes = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance
		.use(apiDeleteChatMessageRoute)
		.use(apiGetChatUsersRoute)
		.use(apiGetCurrentChatUserRoute)
		.use(apiGetDiscordOauthUrlRoute)
		.use(apiGetEmojisRoute)
		.use(apiGetLatestMessagesRoute)
		.use(apiPostClearInactiveUsersRoute)
		.use(apiPostDiscordSignupRoute)
		.use(apiPostGuestLoginRoute)
		.use(apiPostLoginWithTokenRoute)
		.use(apiPostLogoutRoute)
		.use(apiPostSendChatMessageRoute);
};
