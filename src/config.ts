import type { Level as LogLevel } from 'pino';
import { z } from 'zod';

import { lazyObject } from './utils/lazyObject';

const configSchema = z.object({
	LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info') satisfies z.ZodType<LogLevel>,
	LOG_COLORED: z.stringbool().default(false).optional(),

	INTERNAL_SERVER_URL: z.url(),
	PUBLIC_SERVER_URL: z.url(),
	PUBLIC_CLIENT_URL: z.url(),

	DATABASE_URL: z.string().nonempty(),

	SWAGGER_ENABLED: z.stringbool().default(false).optional(),

	MASTER_TOKEN: z.string().nonempty(),
	JWT_SECRET: z.string().nonempty(),

	DISCORD_CLIENT_ID: z.string().nonempty(),
	DISCORD_CLIENT_SECRET: z.string().nonempty(),

	SERVER_TLS_CERT_PATH: z.string().optional(),
	SERVER_TLS_KEY_PATH: z.string().optional(),
});

export const config = lazyObject(() => configSchema.parse(Bun.env));
