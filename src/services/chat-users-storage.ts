import { ChatUserStatus } from 'src/constants/chatUser';
import type { UserJwtTokenContent } from 'src/types/jwt';
import { decodeUserJwtToken, generateUserJwtToken } from 'src/utils/jwt';

export type ChatUserStorageItem = {
	connectionId: string;
	status: ChatUserStatus;
	tokenContent: UserJwtTokenContent;
};

export class ChatUsersStorage {
	protected storage: Record<string, ChatUserStorageItem>;

	constructor() {
		this.storage = {};
	}

	public getUserJwtTokenContent(token: string): UserJwtTokenContent | undefined {
		const decoded = decodeUserJwtToken(token);
		if (!decoded) return;

		const now = Math.floor(Date.now() / 1000);
		if (decoded.exp < now) return;

		return decoded;
	}

	public getUserByToken(token: string): ChatUserStorageItem | undefined {
		const tokenContent = this.getUserJwtTokenContent(token);
		if (tokenContent) {
			return this.storage[token];
		}
	}

	public getUsers() {
		return this.storage;
	}

	public getUsersByStatus(status: ChatUserStatus): [string, ChatUserStorageItem][] {
		const storageEntries = Object.entries(this.storage);
		return storageEntries.filter(item => item[1].status === status);
	}

	public addUser(connectionId: string, userJwtToken: UserJwtTokenContent | string): [string, ChatUserStorageItem] {
		if (typeof userJwtToken === 'string') {
			const jwtTokenContent = decodeUserJwtToken(userJwtToken);
			if (!jwtTokenContent) {
				throw new Error('Internal server error');
			}

			const storageItem: ChatUserStorageItem = {
				connectionId,
				status: ChatUserStatus.active,
				tokenContent: jwtTokenContent,
			};

			this.storage[userJwtToken] = storageItem;
			return [userJwtToken, storageItem];
		}

		const jwtToken = generateUserJwtToken(userJwtToken);

		const storageItem: ChatUserStorageItem = {
			connectionId,
			status: ChatUserStatus.active,
			tokenContent: userJwtToken,
		};

		this.storage[jwtToken] = storageItem;
		return [jwtToken, storageItem];
	}

	public restoreUserConnection(token: string, connectionId: string) {
		if (this.storage[token]) {
			this.storage[token].connectionId = connectionId;
			this.storage[token].status = ChatUserStatus.active;
		}

		return this.storage[token];
	}

	public findUserByConnectionId(connectionId: string): [string, ChatUserStorageItem] | undefined {
		const storageEntries = Object.entries(this.storage);
		const item = storageEntries.find(item => item[1].connectionId === connectionId);
		if (item) {
			return [item[0], item[1]];
		}
	}

	public findUserById(userId: string): [string, ChatUserStorageItem] | undefined {
		const storageEntries = Object.entries(this.storage);
		const item = storageEntries.find(item => item[1].tokenContent.userId === userId);
		if (item) {
			return [item[0], item[1]];
		}
	}

	public findUserByNickname(nickname: string): [string, ChatUserStorageItem] | undefined {
		const storageEntries = Object.entries(this.storage);
		const item = storageEntries.find(item => item[1].tokenContent.nickname === nickname);
		if (item) {
			return [item[0], item[1]];
		}
	}

	public setUserStatus(key: string, newStatus: ChatUserStatus) {
		const user = this.storage[key];
		if (user) {
			user.status = newStatus;
		}
	}

	public removeUser(key: string) {
		delete this.storage[key];
	}
}
