import { randomUUID } from 'node:crypto';
import { sse } from 'elysia';
import jsonStringify from 'fast-json-stringify';

import { CHAT_MESSAGE_API_SCHEMA, CHAT_USER_API_SCHEMA } from 'src/constants/api-schemas';
import { ChatMessageSelect, DEFAULT_NICKNAME_MAP } from 'src/constants/chatMessage';
import { ChatUserStatus } from 'src/constants/chatUser';
import { routes } from 'src/constants/routes';
import type { ElysiaInstance } from 'src/instance';
import { EventKey } from 'src/services/chat-event-listener';

// prime Server-Sent Event route

export const sseRoute = (elysiaInstance: ElysiaInstance) => {
	return elysiaInstance.get(
		routes.sse,
		async function* (ctx) {
			if (ctx.bannedIpStorage.has(ctx.requestIp)) {
				ctx.set.status = 403;
				return;
			}

			// TODO: return this later
			// const connections = ctx.chatEventListener.findConnectionsByIpV4(ctx.requestIp);

			// if (connections.length > 4) {
			// 	ctx.set.status = 429;
			// 	return;
			// }

			const connectionId = randomUUID();

			ctx.chatEventListener.subscribe({
				connectionId,
				ipV4: ctx.requestIp,
			});
			ctx.chatEventListener.dispatchConnectionOpen(connectionId);

			const pingInterval = setInterval(() => {
				ctx.chatEventListener.dispatchPing(connectionId);
			}, 5000);

			ctx.request.signal.addEventListener('abort', () => {
				ctx.logger.info('abort');
				ctx.chatEventListener.dispatchConnectionClose(connectionId);
				ctx.chatEventListener.unsubscribe({ connectionId });
				clearInterval(pingInterval);
			});

			yield sse({
				data: UserConnectedJsonSchema({
					type: 'UserConnected',
					data: { connectionId },
				}),
			});

			const eventIterator = ctx.chatEventListener.toAsyncIterator(connectionId);

			while (!ctx.request.signal.aborted) {
				const eventPromise = await eventIterator.next().then(result => ({ event: result.value?.[0] }));

				const { key, data: eventData } = eventPromise.event;

				switch (key) {
					case EventKey.ping: {
						yield sse({
							data: PingJsonSchema({ type: 'Ping', data: { time: Date.now() } }),
						});
						break;
					}

					case EventKey.connectionOpen: {
						const connections = ctx.chatEventListener.getConnectionsIdList();
						yield sse({
							data: NewOrClosedConnectionJsonSchema({
								type: 'NewConnection',
								data: { connectionsCount: connections.length },
							}),
						});
						break;
					}

					case EventKey.connectionClose: {
						const chatUser = ctx.chatUsersStorage.findUserByConnectionId(eventData);

						if (chatUser) {
							ctx.chatUsersStorage.setUserStatus(chatUser[0], ChatUserStatus.inactive);
							ctx.chatEventListener.dispatchUserInactiveStatus(chatUser[1].tokenContent.userId);
						}

						const connections = ctx.chatEventListener.getConnectionsIdList();
						yield sse({
							data: NewOrClosedConnectionJsonSchema({
								type: 'ConnectionClosed',
								data: { connectionsCount: connections.length },
							}),
						});
						break;
					}

					case EventKey.newChatMessage: {
						const message = await ctx.db.chatMessage.findUniqueOrThrow({
							where: { id: eventData },
							select: ChatMessageSelect,
						});

						const data = CHAT_MESSAGE_API_SCHEMA.parse({
							id: message.id,
							createdAt: message.createdAt.toISOString(),
							userId: message.user?.id || null,
							nickname: message.user?.nickname || message.nickname || DEFAULT_NICKNAME_MAP[message.type],
							text: message.text,
							type: message.type,
						});

						yield sse({
							data: NewChatMessageJsonSchema({
								type: 'NewChatMessage',
								data,
							}),
						});
						break;
					}

					case EventKey.messagesDeleted: {
						yield sse({
							data: JSON.stringify({
								type: 'MessagesDeleted',
								data: { messagesIdList: eventData },
							}),
						});
						break;
					}

					case EventKey.userLogin: {
						const chatUser = ctx.chatUsersStorage.findUserById(eventData);
						if (!chatUser) break;

						const data = CHAT_USER_API_SCHEMA.parse({
							id: eventData,
							nickname: chatUser[1].tokenContent.nickname,
							role: chatUser[1].tokenContent.role,
							status: ChatUserStatus.active,
						});

						yield sse({
							data: UserLoginJsonSchema({
								type: 'UserLogin',
								data,
							}),
						});
						break;
					}

					case EventKey.userInactiveStatus: {
						yield sse({
							data: JSON.stringify({
								type: 'UserInactiveStatus',
								data: { userId: eventData },
							}),
						});
						break;
					}

					case EventKey.userLogout: {
						yield sse({
							data: JSON.stringify({
								type: 'UserLogout',
								data: { userId: eventData },
							}),
						});
						break;
					}
				}
			}
		},
		{ detail: { tags: ['sse'] } },
	);
};

const NewChatMessageJsonSchema = jsonStringify({
	type: 'object',
	properties: {
		type: { type: 'string' },
		data: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				createdAt: { type: 'string' },
				userId: { type: 'string' },
				nickname: { type: 'string' },
				text: { type: 'string' },
			},
			required: ['id', 'createdAt', 'nickname', 'text'],
		},
	},
	required: ['type', 'data'],
});

const UserConnectedJsonSchema = jsonStringify({
	type: 'object',
	properties: {
		type: { type: 'string' },
		data: {
			type: 'object',
			properties: {
				connectionId: { type: 'string' },
			},
			required: ['connectionId'],
		},
	},
	required: ['type', 'data'],
});

const NewOrClosedConnectionJsonSchema = jsonStringify({
	type: 'object',
	properties: {
		type: { type: 'string' },
		data: {
			type: 'object',
			properties: {
				connectionsCount: { type: 'number' },
			},
			required: ['connectionsCount'],
		},
	},
	required: ['type', 'data'],
});

const UserLoginJsonSchema = jsonStringify({
	type: 'object',
	properties: {
		type: { type: 'string' },
		data: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				nickname: { type: 'string' },
				role: { type: 'string' },
				status: { type: 'string' },
			},
			required: ['id', 'nickname'],
		},
	},
	required: ['type', 'data'],
});

const PingJsonSchema = jsonStringify({
	type: 'object',
	properties: {
		type: { type: 'string' },
		data: {
			type: 'object',
			properties: {
				time: { type: 'number' },
			},
			required: ['time'],
		},
	},
	required: ['type', 'data'],
});
