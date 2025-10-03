'use strict';

var getProto = require('./index.js');

// Benchmark utility
function benchmark(name, fn, iterations) {
	var start = Date.now();
	for (var i = 0; i < iterations; i++) {
		fn();
	}
	var end = Date.now();
	var duration = end - start;
	var opsPerSec = Math.round((iterations / duration) * 1000);
	console.log(name + ': ' + opsPerSec.toLocaleString() + ' ops/sec (' + duration + 'ms for ' + iterations.toLocaleString() + ' iterations)');
	return opsPerSec;
}

console.log('=== get-proto Performance Benchmark ===\n');

var iterations = 1000000;

// Test objects
var plainObject = { a: 1 };
var nullProtoObject = Object.create(null);
var arrayObject = [1, 2, 3];
var functionObject = function test() {};
var dateObject = new Date();
var regexObject = /test/;

console.log('1. Plain Object Prototype Lookup');
console.log('   Testing with: { a: 1 }');
benchmark('  First call (uncached)', function () {
	getProto(plainObject);
}, 1);
benchmark('  Subsequent calls (cached)', function () {
	getProto(plainObject);
}, iterations);

console.log('\n2. Null Prototype Object');
console.log('   Testing with: Object.create(null)');
benchmark('  First call (uncached)', function () {
	getProto(nullProtoObject);
}, 1);
benchmark('  Subsequent calls (cached)', function () {
	getProto(nullProtoObject);
}, iterations);

console.log('\n3. Array Object');
console.log('   Testing with: [1, 2, 3]');
benchmark('  First call (uncached)', function () {
	getProto(arrayObject);
}, 1);
benchmark('  Subsequent calls (cached)', function () {
	getProto(arrayObject);
}, iterations);

console.log('\n4. Function Object');
console.log('   Testing with: function test() {}');
benchmark('  First call (uncached)', function () {
	getProto(functionObject);
}, 1);
benchmark('  Subsequent calls (cached)', function () {
	getProto(functionObject);
}, iterations);

console.log('\n5. Date Object');
console.log('   Testing with: new Date()');
benchmark('  First call (uncached)', function () {
	getProto(dateObject);
}, 1);
benchmark('  Subsequent calls (cached)', function () {
	getProto(dateObject);
}, iterations);

console.log('\n6. RegExp Object');
console.log('   Testing with: /test/');
benchmark('  First call (uncached)', function () {
	getProto(regexObject);
}, 1);
benchmark('  Subsequent calls (cached)', function () {
	getProto(regexObject);
}, iterations);

console.log('\n7. Mixed Object Types (uncached)');
console.log('   Testing with new objects each iteration');
var mixedOps = benchmark('  New object each call', function () {
	getProto({ random: Math.random() });
}, iterations / 10); // Fewer iterations for uncached test

console.log('\n8. Cache Efficiency Test');
console.log('   Comparing cached vs uncached performance');
var cachedObj = { cached: true };
getProto(cachedObj); // Prime cache
var cachedOps = benchmark('  Cached lookups', function () {
	getProto(cachedObj);
}, iterations);

var uncachedOps = benchmark('  Uncached lookups', function () {
	getProto({ uncached: true });
}, iterations / 10);

var speedup = Math.round((cachedOps / uncachedOps) * 10) / 10;
console.log('  Cache speedup: ' + speedup + 'x faster');

console.log('\n9. Nested Prototype Chain');
console.log('   Testing with multi-level inheritance');
var Parent = function () {};
var Child = function () {};
Child.prototype = Object.create(Parent.prototype);
var nestedObject = new Child();
benchmark('  First call (uncached)', function () {
	getProto(nestedObject);
}, 1);
benchmark('  Subsequent calls (cached)', function () {
	getProto(nestedObject);
}, iterations);

console.log('\n10. Edge Cases');
try {
	getProto(null);
} catch (e) {
	console.log('  null: throws TypeError as expected');
}
try {
	getProto(undefined);
} catch (e) {
	console.log('  undefined: throws TypeError as expected');
}
try {
	getProto(42);
} catch (e) {
	console.log('  number: throws TypeError as expected');
}
try {
	getProto('string');
} catch (e) {
	console.log('  string: throws TypeError as expected');
}

console.log('\n=== Benchmark Complete ===');
