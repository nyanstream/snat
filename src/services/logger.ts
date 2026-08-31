import { pino } from 'pino';
import pinoPretty from 'pino-pretty';

import { config } from 'src/config';

export const resolveBaseLogger = () => {
	return config.LOG_COLORED ? pino({ level: config.LOG_LEVEL }, pinoPretty()) : pino({ level: config.LOG_LEVEL });
};
