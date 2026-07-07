import {assert} from "chai";

import ee from '../src/wrap-event-emitter'
import {sleep} from './test-helper'

describe('bubbling', () => {
	it('should bubbling result', () => {
		const ee1 = ee()
    let count = 0
    ee1.result = 0
		ee1.on('test', function(a, b) {
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})
		ee1.on('test', function(a, b) {
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})
		ee1.on('test', function(a, b) {
      ++count
		})

    assert.equal(ee1.emit('test', 1, 2), 6);
    assert.equal(count, 3);
	});

  it('should stop bubbling', () => {
		const ee1 = ee()
    let count = 0
    ee1.result = 0
		ee1.on('test', function(a, b) {
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})
		ee1.on('test', function(a, b) {
      this.stopped = true
      ++count
		})
		ee1.on('test', function(a, b) {
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})

    assert.equal(ee1.emit('test', 1, 2), 3);
    assert.equal(count, 2);
	});

  it('should bubbling result async', async () => {
		const ee1 = ee()
    let count = 0
    ee1.result = 0
		ee1.on('test', async function(a, b) {
      await sleep(50)
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})
		ee1.on('test', async function(a, b) {
      await sleep(50)
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})
		ee1.on('test', async function(a, b) {
      await sleep(50)
      ++count
		})

    assert.equal(await ee1.emitAsync('test', 1, 2), 6);
    assert.equal(count, 3);
	});

  it('should stop bubbling async', async () => {
		const ee1 = ee()
    let count = 0
    ee1.result = 0
		ee1.on('test', async function(a, b) {
      await sleep(50)
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})
		ee1.on('test', async function(a, b) {
      await sleep(50)
      this.stopped = true
      ++count
		})
		ee1.on('test', async function(a, b) {
      await sleep(50)
      const r = this.result || 0
      this.result = a + b + r
      ++count
		})

    assert.equal(await ee1.emitAsync('test', 1, 2), 3);
    assert.equal(count, 2);
	});
});
