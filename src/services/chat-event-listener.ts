import { EventEmitter, on } from 'node:events';

import { type ConnectionInfo, ConnectionsStorage } from './connections-storage';

type SubscribeInputArgs = {
	connectionId: string;
	ipV4: string;
	pingCallback?: (connectionId: string) => void;
	connectionOpenCallback?: (connectionId: string) => void;
	connectionCloseCallback?: (connectionId: string) => void;
	newChatMessageCallback?: (messageId: string) => void | Promise<void>;
	messagesDeletedCallback?: (messagesIdList: string[]) => void | Promise<void>;
	userLoginCallback?: (userId: string) => void;
	userInactiveStatusCallback?: (userId: string) => void;
	userLogoutCallback?: (userId: string) => void | Promise<void>;
};

type UnsubscribeInputArgs = {
	connectionId: string;
};

export const EventKey = {
	ping: 'ping',
	connectionOpen: 'connectionOpen',
	connectionClose: 'connectionClose',
	newChatMessage: 'newChatMessage',
	messagesDeleted: 'messagesDeleted',
	userLogin: 'userLogin',
	userInactiveStatus: 'userInactiveStatus',
	userLogout: 'userLogout',
} as const;

export class ChatEventListener {
	protected listener: EventEmitter;
	protected connectionsStorage: ConnectionsStorage;

	constructor() {
		this.listener = new EventEmitter();
		this.listener.setMaxListeners(Number.POSITIVE_INFINITY);
		this.connectionsStorage = new ConnectionsStorage();
	}

	public getListener = () => {
		return this.listener;
	};

	public getConnections = () => {
		return this.connectionsStorage.getConnections();
	};

	public getConnectionsIdList = () => {
		return this.connectionsStorage.getConnectionsIdList();
	};

	public checkIsConnectionExists = (connectionId: string) => {
		return this.getConnectionsIdList().includes(connectionId);
	};

	public findConnectionsByIpV4(ipV4: string): [string, ConnectionInfo][] {
		const storageEntries = this.getConnections();
		return storageEntries.filter(item => item[1].ipV4 === ipV4);
	}

	public toAsyncIterator(connectionId: string) {
		return on(this.listener, `connection:${connectionId}`);
	}

	public subscribe({
		connectionId,
		ipV4,
		pingCallback = () => {},
		connectionOpenCallback = () => {},
		connectionCloseCallback = () => {},
		newChatMessageCallback = () => {},
		messagesDeletedCallback = () => {},
		userLoginCallback = () => {},
		userInactiveStatusCallback = () => {},
		userLogoutCallback = () => {},
	}: SubscribeInputArgs) {
		this.connectionsStorage.addConnection(connectionId, { ipV4 });
		this.listener.addListener(
			`connection:${connectionId}`,
			// biome-ignore lint/suspicious/noExplicitAny: This is a valid use case for any
			(event: { key: keyof typeof EventKey; data: any }) => {
				switch (event.key) {
					case EventKey.ping:
						pingCallback(event.data);
						break;
					case EventKey.connectionOpen:
						connectionOpenCallback(event.data);
						break;
					case EventKey.connectionClose:
						connectionCloseCallback(event.data);
						break;
					case EventKey.newChatMessage:
						newChatMessageCallback(event.data);
						break;
					case EventKey.messagesDeleted:
						messagesDeletedCallback(event.data);
						break;
					case EventKey.userLogin:
						userLoginCallback(event.data);
						break;
					case EventKey.userInactiveStatus:
						userInactiveStatusCallback(event.data);
						break;
					case EventKey.userLogout:
						userLogoutCallback(event.data);
						break;
				}
			},
		);
	}

	public unsubscribe({ connectionId }: UnsubscribeInputArgs) {
		this.connectionsStorage.removeConnection(connectionId);
		this.listener.removeListener(`connection:${connectionId}`, () => {});
	}

	// biome-ignore lint/suspicious/noExplicitAny: This is a valid use case for any
	protected dispatchEvent(key: keyof typeof EventKey, data: any) {
		for (const connection of this.connectionsStorage.getConnectionsIdList()) {
			this.listener.emit(`connection:${connection}`, { key, data });
		}
	}

	public dispatchPing(connectionId: string) {
		this.dispatchEvent(EventKey.ping, connectionId);
	}

	public dispatchConnectionOpen(connectionId: string) {
		this.dispatchEvent(EventKey.connectionOpen, connectionId);
	}

	public dispatchConnectionClose(connectionId: string) {
		this.dispatchEvent(EventKey.connectionClose, connectionId);
	}

	public dispatchNewChatMessage(messageId: string) {
		this.dispatchEvent(EventKey.newChatMessage, messageId);
	}

	public dispatchMessagesDeleted(messagesIdList: string[]) {
		this.dispatchEvent(EventKey.messagesDeleted, messagesIdList);
	}

	public dispatchUserLogin(userId: string) {
		this.dispatchEvent(EventKey.userLogin, userId);
	}

	public dispatchUserInactiveStatus(userId: string) {
		this.dispatchEvent(EventKey.userInactiveStatus, userId);
	}

	public dispatchUserLogout(userId: string) {
		this.dispatchEvent(EventKey.userLogout, userId);
	}
}
