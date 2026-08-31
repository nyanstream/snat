import Bun from 'bun'

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
	schema: 'prisma/schema',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: Bun.env.DATABASE_URL,
	},
})

