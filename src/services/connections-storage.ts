export type ConnectionInfo = {
	ipV4: string;
};

export class ConnectionsStorage {
	protected storage: Map<string, ConnectionInfo>;

	constructor() {
		this.storage = new Map();
	}

	public addConnection(connectionId: string, connectionInfo: ConnectionInfo): void {
		this.storage.set(connectionId, connectionInfo);
	}

	public getConnection(connectionId: string): ConnectionInfo | undefined {
		return this.storage.get(connectionId);
	}

	public getConnections(): [string, ConnectionInfo][] {
		return [...this.storage.entries()];
	}

	public getConnectionsIdList(): string[] {
		return [...this.storage.keys()];
	}

	public removeConnection(connectionId: string): void {
		this.storage.delete(connectionId);
	}
}
