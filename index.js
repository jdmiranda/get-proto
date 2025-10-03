'use strict';

var reflectGetProto = require('./Reflect.getPrototypeOf');
var originalGetProto = require('./Object.getPrototypeOf');

var getDunderProto = require('dunder-proto/get');

/*
 * WeakMap cache for prototype lookups - only caches objects/functions
 */
var protoCache = typeof WeakMap === 'undefined' ? null : new WeakMap();

/** @type {import('.')} */
module.exports = reflectGetProto
	? function getProto(O) {
		/*
		 * Fast path for Reflect.getPrototypeOf with caching
		 * Check cache first if WeakMap is available
		 */
		if (protoCache) {
			var cached = protoCache.get(O);
			if (cached !== undefined) {
				return cached;
			}
		}

		// @ts-expect-error TS can't narrow inside a closure, for some reason
		var proto = reflectGetProto(O);

		/*
		 * Cache the result for objects and functions
		 */
		if (protoCache && (typeof O === 'object' || typeof O === 'function') && O !== null) {
			protoCache.set(O, proto);
		}

		return proto;
	}
	: originalGetProto
		? function getProto(O) {
			/*
			 * Optimize type checking - check for null/undefined first (most common edge case)
			 * catches both null and undefined
			 */
			if (O === null || O === undefined) {
				throw new TypeError('getProto: not an object');
			}

			var typeOfO = typeof O;
			/*
			 * Fast rejection for primitives
			 */
			if (typeOfO !== 'object' && typeOfO !== 'function') {
				throw new TypeError('getProto: not an object');
			}

			/*
			 * Check cache first if WeakMap is available
			 */
			if (protoCache) {
				var cached = protoCache.get(O);
				if (cached !== undefined) {
					return cached;
				}
			}

			// @ts-expect-error TS can't narrow inside a closure, for some reason
			var proto = originalGetProto(O);

			/*
			 * Cache the result
			 */
			if (protoCache) {
				protoCache.set(O, proto);
			}

			return proto;
		}
		: getDunderProto
			? function getProto(O) {
				/*
				 * Fallback path - still use cache if available
				 */
				if (protoCache && (typeof O === 'object' || typeof O === 'function') && O !== null) {
					var cached = protoCache.get(O);
					if (cached !== undefined) {
						return cached;
					}
				}

				// @ts-expect-error TS can't narrow inside a closure, for some reason
				var proto = getDunderProto(O);

				/*
				 * Cache the result for objects and functions
				 */
				if (protoCache && (typeof O === 'object' || typeof O === 'function') && O !== null) {
					protoCache.set(O, proto);
				}

				return proto;
			}
			: null;
