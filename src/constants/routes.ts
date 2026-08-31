export const routes = {
	// static
	index: '/',
	chat: '/chat',

	// Server-Sent Event
	sse: '/sse',

	// api docs (swagger),
	apiDocs: '/apidocs',

	// api get
	apiGetChatUsers: '/api/get-chat-users',
	apiGetCurrentChatUser: '/api/get-current-chat-user',
	apiGetDiscordOauthUrl: '/api/get-discord-oauth-url',
	apiGetEmojis: '/api/get-emojis',
	apiGetLatestMessages: '/api/get-latest-messages',

	// api post
	apiPostClearInactiveUsers: '/api/post-clear-inactive-users',
	apiPostDiscordSignup: '/api/post-discord-signup',
	apiPostGuestLogin: '/api/post-guest-login',
	apiPostLoginWithToken: '/api/post-login-with-token',
	apiPostLogout: '/api/post-logout',
	apiPostSendChatMessage: '/api/post-send-chat-message',

	// api delete
	apiDeleteChatMessage: '/api/delete-chat-message',

	// oauth
	oauthDiscordCallback: '/oauth/discord-callback',
} as const satisfies Record<string, string>;
