// biome-ignore-all lint/correctness/noUnusedFunctionParameters: unnecessary

import { memoize } from 'es-toolkit';

// biome-ignore lint/complexity/noBannedTypes: its safe here
type NotFunction<T> = T extends Function ? never : T;

export const lazyObject = <T extends object>(resolve: () => NotFunction<T>): T => {
	const resolveValue = memoize(resolve);

	return new Proxy(
		{},
		{
			defineProperty: (target, key, attributes) => Reflect.defineProperty(resolveValue(), key, attributes),
			deleteProperty: (target, propertyKey) => Reflect.deleteProperty(resolveValue(), propertyKey),
			get: (target, propertyKey) => Reflect.get(resolveValue(), propertyKey),
			getOwnPropertyDescriptor: (target, propertyKey) => Reflect.getOwnPropertyDescriptor(resolveValue(), propertyKey),
			getPrototypeOf: () => Reflect.getPrototypeOf(resolveValue()),
			has: (target, propertyKey) => Reflect.has(resolveValue(), propertyKey),
			isExtensible: () => Reflect.isExtensible(resolveValue()),
			ownKeys: () => Reflect.ownKeys(resolveValue()),
			preventExtensions: () => Reflect.preventExtensions(resolveValue()),
			set: (target, propertyKey, value) => Reflect.set(resolveValue(), propertyKey, value),
			setPrototypeOf: (target, proto) => Reflect.setPrototypeOf(resolveValue(), proto),
		},
	) as T;
};
