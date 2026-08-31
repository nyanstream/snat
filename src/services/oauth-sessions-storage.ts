import { randomUUID } from 'node:crypto';

export type SessionItem = {
	type: 'discord';
	serviceUserId: string;
	expiresAt: string;
};

export class OauthSessionsStorage {
	protected sessions: Map<string, SessionItem>;

	constructor() {
		this.sessions = new Map();
	}

	addSession(serviceUserId: string): [string, SessionItem] {
		const sessionId = randomUUID();
		const expiresAt = new Date(Date.now() + 1000 * 60 * 5).toISOString();
		const sessionItem: SessionItem = {
			type: 'discord',
			serviceUserId,
			expiresAt,
		};

		this.sessions.set(sessionId, sessionItem);

		return [sessionId, sessionItem];
	}

	getSession(sessionId: string): SessionItem | undefined {
		const session = this.sessions.get(sessionId);

		if (session) {
			if (new Date(session.expiresAt) > new Date()) {
				return session;
			}
			this.removeSession(sessionId);
		}

		return undefined;
	}

	getExpiredSessions(): [string, SessionItem][] {
		const expiredSessions: [string, SessionItem][] = [];

		for (const [sessionId, session] of this.sessions) {
			if (new Date(session.expiresAt) < new Date()) {
				expiredSessions.push([sessionId, session]);
			}
		}

		return expiredSessions;
	}

	removeSession(sessionId: string) {
		this.sessions.delete(sessionId);
	}
}
