declare module 'bun' {
	interface Env {
		LOG_LEVEL: string;
		LOG_COLORED?: boolean;
		SWAGGER_ENABLED?: boolean;
		INTERNAL_SERVER_URL: string;
		PUBLIC_SERVER_URL: string;
		PUBLIC_CLIENT_URL: string;
		DATABASE_URL: string;
		JWT_SECRET: string;
		DISCORD_CLIENT_ID: string;
		DISCORD_CLIENT_SECRET: string;
		SERVER_TLS_CERT_PATH?: string;
		SERVER_TLS_KEY_PATH?: string;
	}
}

export {};
