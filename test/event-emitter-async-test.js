import {assert} from "chai";

import wrapEventEmitter from '../src/wrap-event-emitter'
import {deepEqu, sleep} from './test-helper'
describe('event-emitter-async', () => {
	it('should emit', async () => {
		var x = wrapEventEmitter(), y, count, count2, count3, count4, test, listener1, listener2;
		var defaultEvent = {stopped:false, result: undefined, type: 'foo'};
		await x.emitAsync('none');

		test = "Once: ";
		count = 0;
		x.once('foo', async function (a1, a2, a3) {
			defaultEvent.target = x;
			await sleep(10)
			deepEqu(this, defaultEvent, test + "Context");
			deepEqu([a1, a2, a3], ['foo', x, 15], test + "Arguments");
			++count;
		});

		await x.emitAsync('foobar');
		assert.equal(count, 0, test + "Not invoked on other event");
		await x.emitAsync('foo', 'foo', x, 15);
		assert.equal(count, 1, test + "Emitted");
		await x.emitAsync('foo');
		assert.equal(count, 1, test + "Emitted once");

		test = "On & Once: ";
		count = 0;
		x.on('foo', listener1 = async function (a1, a2, a3) {
			defaultEvent.target = x;
			await sleep(10)
			deepEqu(this, defaultEvent, test + "Context");
			deepEqu([a1, a2, a3], ['foo', x, 15], test + "Arguments");
			++count;
		});
		count2 = 0;
		x.once('foo', listener2 = async function (a1, a2, a3) {
			defaultEvent.target = x;
			deepEqu(this, defaultEvent, test + "Context");
			deepEqu([a1, a2, a3], ['foo', x, 15], test + "Arguments");
			++count2;
		});

		await x.emitAsync('foobar');
		assert.equal(count, 0, test + "Not invoked on other event");
		await x.emitAsync('foo', 'foo', x, 15);
		assert.equal(count, 1, test + "Emitted");
		await x.emitAsync('foo', 'foo', x, 15);
		assert.equal(count, 2, test + "Emitted twice");
		assert.equal(count2, 1, test + "Emitted once");
		x.off('foo', listener1);
		await x.emitAsync('foo');
		assert.equal(count, 2, test + "Not emitter after off");

		count = 0;
		x.once('foo', listener1 = async function () { ++count; });

		x.off('foo', listener1);
		await x.emitAsync('foo');
		assert.equal(count, 0, "Once Off: Not emitted");

		count = 0;
		x.on('foo', listener2 = function () {});
		x.once('foo', listener1 = function () { ++count; });

		x.off('foo', listener1);
		await x.emitAsync('foo');
		assert.equal(count, 0, "Once Off (multi): Not emitted");
		x.off('foo', listener2);

		test = "Prototype Share: ";

		y = Object.create(x);

		count = 0;
		count2 = 0;
		count3 = 0;
		count4 = 0;
		x.on('foo', async function () {
			++count;
		});
		y.on('foo', function () {
			++count2;
		});
		x.once('foo', function () {
			++count3;
		});
		y.once('foo', function () {
			++count4;
		});
		await x.emitAsync('foo');
		assert.equal(count, 1, test + "x on count");
		assert.equal(count2, 0, test + "y on count");
		assert.equal(count3, 1, test + "x once count");
		assert.equal(count4, 0, test + "y once count");

		await y.emitAsync('foo');
		assert.equal(count, 1, test + "x on count");
		assert.equal(count2, 1, test + "y on count");
		assert.equal(count3, 1, test + "x once count");
		assert.equal(count4, 1, test + "y once count");

		await x.emitAsync('foo');
		assert.equal(count, 2, test + "x on count");
		assert.equal(count2, 1, test + "y on count");
		assert.equal(count3, 1, test + "x once count");
		assert.equal(count4, 1, test + "y once count");

		await y.emitAsync('foo');
		assert.equal(count, 2, test + "x on count");
		assert.equal(count2, 2, test + "y on count");
		assert.equal(count3, 1, test + "x once count");
		assert.equal(count4, 1, test + "y once count");

		test = "Event: ";
		count = 0;
		count2 = 0;
		x.on('efoo', function () {
			++count;
			this.result = 129;
		});
		x.on('efoo', function () {
			++count;
		});
		x.on('ebar', function () {
			++count2;
			this.result = "hiFirst"
			this.stopped = true;
		});
		x.on('ebar', function () {
			++count2;
			this.result = "hiSec"
		});
		assert.equal(await x.emitAsync('efoo'), 129, test + 'foo result');
		assert.equal(await x.emitAsync('ebar'), "hiFirst", test + 'bar result');
		assert.equal(count, 2, test + "foo type");
		assert.equal(count2, 1, test + "bar type");
	});
});
