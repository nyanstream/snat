import { parseArgs } from 'node:util';
import Bun from 'bun';

import { config } from './config';
import { routes } from './constants/routes';

try {
	const { values } = parseArgs({
		args: Bun.argv,
		strict: true,
		allowPositionals: true,
		options: {
			command: {
				type: 'string',
			},
		},
	});

	switch (values.command) {
		case 'clearInactiveUsers': {
			// TODO: create shared function for this logic, internal fetches is a bad pattern
			const response = await fetch(new URL(routes.apiPostClearInactiveUsers, config.INTERNAL_SERVER_URL), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ MASTER_TOKEN: config.MASTER_TOKEN }),
			});
			if (!response.ok) {
				throw new Error(`Failed to clear inactive users: ${response.status} ${response.statusText}`);
			}
			break;
		}
	}
} catch (error) {
	console.error('Failed to execute command:', error);
	process.exit(1);
}
