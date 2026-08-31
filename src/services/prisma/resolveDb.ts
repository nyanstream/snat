import { PrismaPg } from '@prisma/adapter-pg';
import type { Logger } from 'pino';
import { escapeWhitespace, formatQuery } from 'prisma-query-formatter';

import { config } from 'src/config';

import { PrismaClient } from './__generated__/client';

export const resolveDb = (logger: Logger) => {
	const adapter = new PrismaPg({
		connectionString: config.DATABASE_URL,
	});

	const db = new PrismaClient({
		adapter,
		log: [
			{ emit: 'event', level: 'query' },
			{ emit: 'event', level: 'info' },
			{ emit: 'event', level: 'warn' },
			{ emit: 'event', level: 'error' },
		],
	});

	db.$on('query', e => {
		const queryString = formatQuery(e.query, e.params, {
			paramTransformer: escapeWhitespace,
		});
		logger.debug({ duration: e.duration }, queryString);
	});

	db.$on('info', e => logger.info(e.message));
	db.$on('warn', e => logger.warn(e.message));
	db.$on('error', e => logger.error(e.message));

	return db;
};
