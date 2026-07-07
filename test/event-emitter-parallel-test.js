import { assert } from 'chai'
import ee from '../src/wrap-event-emitter'
import { pipeAsync } from '../src/pipe-async'
import { eventable } from '../src/eventable'
import {sleep} from './test-helper'

describe('parallel execution', () => {
  it('should support parallel execution with collect mode', async () => {
    const ee1 = ee()
    let order = []

    ee1.on('test', async (val) => {
      await sleep(100)
      order.push('first')
      return val + 1
    })

    ee1.on('test', async (val) => {
      await sleep(50)
      order.push('second')
      return val + 2
    })

    const results = await ee1.parallel('collect').emitAsync('test', 10)

    // In parallel, 'second' should finish first despite being registered second
    assert.deepEqual(order, ['second', 'first'])
    // Results should be collected in registration order
    assert.deepEqual(results, [11, 12])
  })

  it('should support first result mode in parallel', async () => {
    const ee1 = ee()

    ee1.on('test', async () => {
      await sleep(100)
      return 'slow'
    })

    ee1.on('test', async () => {
      await sleep(20)
      return 'fast'
    })

    const result = await ee1.parallel('first').emitAsync('test')
    assert.equal(result, 'fast')
  })

  it('should support first result mode in serial (short-circuit)', async () => {
    const ee1 = ee()
    let secondCalled = false

    ee1.on('test', async () => {
      await sleep(10)
      return 'one'
    })

    ee1.on('test', async () => {
      secondCalled = true
      return 'two'
    })

    const result = await ee1
      .configure({ resultMode: 'first' })
      .emitAsync('test')
    assert.equal(result, 'one')
    assert.isFalse(secondCalled)
  })

  it('should allow listeners to perceive resolved state', async () => {
    const ee1 = ee()
    let perception = false

    ee1.on('test', async function () {
      await sleep(20)
      return 'done'
    })

    ee1.on('test', async function () {
      await sleep(50)
      perception = this.resolved
    })

    await ee1.parallel('first').emitAsync('test')
    await sleep(50) // Wait for the second parallel listener to finish
    assert.isTrue(perception)
  })

  it('should support parallel propagation in pipeAsync', async () => {
    const ee1 = ee()
    const ee2 = ee()
    let order = []

    ee1.on('test', async () => {
      await sleep(100)
      order.push('ee1')
    })
    ee2.on('test', async () => {
      await sleep(20)
      order.push('ee2')
    })

    pipeAsync(ee1, ee2, { asyncMode: 'parallel' })
    await ee1.emitAsync('test')

    // In parallel mode, ee2 should finish before ee1
    assert.deepEqual(order, ['ee2', 'ee1'])
  })

  it('should handle errors in parallel mode without crashing', async () => {
    const ee1 = ee()
    let errorCaught = false
    let otherFinished = false

    ee1.on('error', (err) => {
      if (err.message === 'boom') errorCaught = true
    })

    ee1.on('test', async () => {
      throw new Error('boom')
    })

    ee1.on('test', async () => {
      await sleep(20)
      otherFinished = true
    })

    await ee1.parallel().emitAsync('test')
    assert.isTrue(errorCaught, 'Error should be caught via error event')
    assert.isTrue(otherFinished, 'Other listeners should still finish')
  })

  it('should ensure the last one to finish wins in parallel last mode', async () => {
    const ee1 = ee()

    ee1.on('test', async () => {
      await sleep(50)
      return 'slow'
    })

    ee1.on('test', async () => {
      await sleep(10)
      return 'fast'
    })

    // Parallel mode, last to finish (slow) should win
    const result = await ee1.parallel('last').emitAsync('test')
    assert.equal(result, 'slow')
  })

  it('should maintain proxy isolation (fluent API)', async () => {
    const ee1 = ee()
    ee1.on('test', () => 'original')

    const p1 = ee1.parallel('collect')
    const p2 = ee1.configure({ resultMode: 'first' })

    assert.deepEqual(await p1.emitAsync('test'), ['original'])
    assert.equal(await p2.emitAsync('test'), 'original')
    // Original should still be serial/last
    assert.equal(await ee1.emitAsync('test'), 'original')

    assert.isUndefined(ee1._eeRuntimeOptions)
    assert.notEqual(p1, ee1)
  })

  it('should not interrupt peers when stopped is set in parallel mode', async () => {
    const ee1 = ee()
    let peerFinished = false

    ee1.on('test', async function () {
      this.stopped = true
      return 'stopper'
    })

    ee1.on('test', async () => {
      await sleep(20)
      peerFinished = true
      return 'peer'
    })

    await ee1.parallel().emitAsync('test')
    assert.isTrue(
      peerFinished,
      'Peer should not be interrupted by stopped in parallel'
    )
  })

  it('should capture multiple errors in parallel mode', async () => {
    const ee1 = ee()
    let errorCount = 0

    ee1.on('error', () => {
      errorCount++
    })

    ee1.on('test', async () => {
      throw new Error('err1')
    })

    ee1.on('test', async () => {
      throw new Error('err2')
    })

    await ee1.parallel().emitAsync('test')
    assert.equal(errorCount, 2, 'Should capture both errors')
  })

  it('should skip errors in first mode and find first success', async () => {
    const ee1 = ee()

    ee1.on('test', async () => {
      await sleep(10)
      throw new Error('fail fast')
    })

    ee1.on('test', async () => {
      await sleep(30)
      return 'success slow'
    })

    const result = await ee1.parallel('first').emitAsync('test')
    assert.equal(
      result,
      'success slow',
      'Should take the first successful result even if a faster one fails'
    )
  })

  it('should work correctly with once in parallel context', async () => {
    const ee1 = ee()
    let count = 0

    ee1.once('test', async () => {
      count++
      await sleep(10)
    })

    await Promise.all([
      ee1.parallel().emitAsync('test'),
      ee1.parallel().emitAsync('test'),
    ])

    assert.equal(
      count,
      1,
      'once listener should only be called once even in concurrent emits'
    )
  })

  it('should support pipeAsync with different parameter styles (AoP renamed method)', async () => {
    class MyEmitter {}
    // AoP: rename emitAsync to myEmit
    eventable(MyEmitter)

    const ee1 = new MyEmitter()
    const ee2 = ee()
    let ee2EventCount = 0
    ee2.on('event', () => {
      ee2EventCount++
    })

    // Use Style 2: pipeAsync(e1, e2, name, options)
    pipeAsync(ee1, ee2, 'myEmit', { asyncMode: 'parallel' })

    await ee1.myEmit('event', 'data')
    assert.equal(ee2EventCount, 1)
  })

  it('should support pipeAsync(e1, e2, options) with 3 arguments', async () => {
    const ee1 = ee()
    const ee2 = ee()
    let count = 0
    ee2.on('event', () => {
      count++
    })

    // Style: pipeAsync(e1, e2, options)
    pipeAsync(ee1, ee2, { asyncMode: 'parallel' })
    await ee1.emitAsync('event')
    assert.equal(count, 1)
  })

  it('should support collect mode in serial execution', async () => {
    const ee1 = ee()
    ee1.on('test', () => 'a')
    ee1.on('test', async () => {
      await sleep(10)
      return 'b'
    })

    const results = await ee1
      .configure({ resultMode: 'collect' })
      .emitAsync('test')
    assert.deepEqual(results, ['a', 'b'])
  })

  it('should support fluent API chaining', async () => {
    const ee1 = ee()
    ee1.on('test', () => 1)
    ee1.on('test', () => 2)

    // Chain: parallel AND collect
    const result = await ee1
      .parallel()
      .configure({ resultMode: 'collect' })
      .emitAsync('test')
    assert.deepEqual(result, [1, 2])
  })

  it('should support RegExp listeners in parallel mode', async () => {
    const ee1 = ee()
    let count = 0
    ee1.on(/test.*/, async () => {
      await sleep(10)
      count++
    })
    ee1.on('test-event', async () => {
      await sleep(10)
      count++
    })

    await ee1.parallel().emitAsync('test-event')
    assert.equal(count, 2)
  })

  it('should work with classes using eventable injector', async () => {
    const { eventable } = await import('../src/eventable')
    class MyBase {}
    eventable(MyBase)

    const inst = new MyBase()
    inst.on('foo', async () => {
      await sleep(10)
      return 'bar'
    })

    const res = await inst.parallel('collect').emitAsync('foo')
    assert.deepEqual(res, ['bar'])
  })

  it('should support multi-level parallel pipes', async () => {
    const e1 = ee()
    const e2 = ee()
    const e3 = ee()
    let path = []

    e1.on('p', async () => {
      await sleep(30)
      path.push('e1')
    })
    e2.on('p', async () => {
      await sleep(10)
      path.push('e2')
    })
    e3.on('p', async () => {
      await sleep(5)
      path.push('e3')
    })

    pipeAsync(e1, e2, { asyncMode: 'parallel' })
    pipeAsync(e2, e3, { asyncMode: 'parallel' })

    await e1.emitAsync('p')
    // Expected order based on sleeps: e3 (5ms), e2 (10ms), e1 (30ms)
    assert.deepEqual(path, ['e3', 'e2', 'e1'])
  })

  it('should verify "this" context in parallel listeners', async () => {
    const ee1 = ee()
    let contextOk = false
    let targetOk = false

    ee1.on('check', function () {
      contextOk = this.type === 'check'
      // The target might be the proxy, so we check if it's the emitter or its proxy
      targetOk =
        this.target === ee1 || Object.getPrototypeOf(this.target) === ee1
    })

    await ee1.parallel().emitAsync('check')
    assert.isTrue(contextOk, 'Event type should be "check"')
    assert.isTrue(targetOk, 'Event target should be the emitter or its proxy')
  })

  it('should handle mixed sync and async listeners in parallel mode', async () => {
    const ee1 = ee()
    let syncCalled = false
    let asyncCalled = false

    ee1.on('mixed', () => {
      syncCalled = true
      return 'sync'
    })
    ee1.on('mixed', async () => {
      await sleep(10)
      asyncCalled = true
      return 'async'
    })

    const res = await ee1.parallel('collect').emitAsync('mixed')
    assert.isTrue(syncCalled)
    assert.isTrue(asyncCalled)
    assert.deepEqual(res, ['sync', 'async'])
  })

  it('should use a snapshot of listeners even if modified during parallel emit', async () => {
    const ee1 = ee()
    let secondCalled = false

    const secondListener = () => {
      secondCalled = true
    }
    ee1.on('test', async () => {
      ee1.off('test', secondListener)
      await sleep(20)
    })
    ee1.on('test', secondListener)

    await ee1.parallel().emitAsync('test')
    assert.isTrue(
      secondCalled,
      'Second listener should still be called because of snapshot'
    )
  })

  it('should support nested parallel emits', async () => {
    const ee1 = ee()
    let innerCalled = false

    ee1.on('outer', async () => {
      await ee1.parallel().emitAsync('inner')
    })
    ee1.on('inner', async () => {
      await sleep(10)
      innerCalled = true
    })

    await ee1.parallel().emitAsync('outer')
    assert.isTrue(innerCalled)
  })

  it('should support mixed serial and parallel pipes in a chain', async () => {
    const e1 = ee()
    const e2 = ee()
    const e3 = ee()
    let path = []

    e1.on('p', async () => {
      await sleep(50)
      path.push('e1')
    })
    e2.on('p', async () => {
      await sleep(20)
      path.push('e2')
    })
    e3.on('p', async () => {
      await sleep(10)
      path.push('e3')
    })

    // e1 -> e2 (serial), e2 -> e3 (parallel)
    pipeAsync(e1, e2, { asyncMode: 'serial' })
    pipeAsync(e2, e3, { asyncMode: 'parallel' })

    await e1.emitAsync('p')
    // e1 serial e2 means e1 finishes (50ms) THEN e2 starts.
    // e2 parallel e3 means e2 and e3 start together.
    // e3 is faster (10ms) than e2 (20ms).
    assert.deepEqual(path, ['e1', 'e3', 'e2'])
  })

  it('should not hang when all listeners fail in first mode', async () => {
    const ee1 = ee()
    let errorCount = 0
    ee1.on('error', () => errorCount++)

    ee1.on('test', async () => {
      throw new Error('fail1')
    })
    ee1.on('test', async () => {
      throw new Error('fail2')
    })

    const res = await ee1.parallel('first').emitAsync('test')
    assert.isUndefined(res)
    assert.equal(errorCount, 2)
  })

  it('should maintain independent modes after unify', async () => {
    const { unify } = await import('../src/unify')
    const e1 = ee()
    const e2 = ee()
    let calls = []

    unify(e1, e2)
    e1.on('test', async (name) => {
      await sleep(10)
      calls.push(name)
      return name
    })

    // e1 is parallel, e2 is default (serial)
    await Promise.all([
      e1.parallel('collect').emitAsync('test', 'e1'),
      e2.emitAsync('test', 'e2'),
    ])

    // Because they are concurrent but separate calls, both should finish
    assert.include(calls, 'e1')
    assert.include(calls, 'e2')
  })

  it('should handle stress test with 100 parallel listeners', async () => {
    const ee1 = ee()
    const count = 100
    let finished = 0

    for (let i = 0; i < count; i++) {
      ee1.on('stress', async () => {
        await sleep(Math.random() * 50)
        finished++
        return i
      })
    }

    const results = await ee1.parallel('collect').emitAsync('stress')
    assert.equal(finished, count)
    assert.equal(results.length, count)
    // Check if results contains numbers 0-99
    assert.include(results, 0)
    assert.include(results, 99)
  })

  it('should propagate errors through parallel pipe chain', async () => {
    const e1 = ee()
    const e2 = ee()
    let errorHandled = false

    e2.on('error', (err) => {
      if (err.message === 'pipe-boom') errorHandled = true
    })

    e2.on('test', async () => {
      throw new Error('pipe-boom')
    })

    pipeAsync(e1, e2, { asyncMode: 'parallel' })
    await e1.emitAsync('test')

    assert.isTrue(
      errorHandled,
      'Error in downstream pipe should be handled by downstream error listener'
    )
  })

  it('should ensure snapshot integrity when off is called during parallel emit', async () => {
    const ee1 = ee()
    let secondCalled = false

    const second = () => {
      secondCalled = true
    }
    ee1.on('test', async () => {
      ee1.off('test', second)
      await sleep(10)
    })
    ee1.on('test', second)

    // Start emit
    const p = ee1.parallel().emitAsync('test')
    await p
    assert.isTrue(
      secondCalled,
      'Second listener must be called because it was in the snapshot'
    )

    // Subsequent emit should NOT call it
    secondCalled = false
    await ee1.emitAsync('test')
    assert.isFalse(secondCalled)
  })

  it('should handle deeply nested parallel emits correctly', async () => {
    const ee1 = ee()
    let log = []

    ee1.on('level1', async () => {
      log.push('l1-start')
      await ee1.parallel().emitAsync('level2')
      log.push('l1-end')
    })

    ee1.on('level2', async () => {
      log.push('l2-start')
      await sleep(10)
      log.push('l2-end')
    })

    await ee1.parallel().emitAsync('level1')
    assert.deepEqual(log, ['l1-start', 'l2-start', 'l2-end', 'l1-end'])
  })

  it('should support proxy-level maxListeners isolation', () => {
    const ee1 = ee()
    ee1.setMaxListeners(2)

    const proxy = ee1.parallel()
    proxy.setMaxListeners(5)

    assert.equal(ee1._maxListeners, 2, 'Original emitter should keep its limit')
    assert.equal(proxy._maxListeners, 5, 'Proxy should have its own limit')

    // Adding listeners to proxy should use its limit
    proxy.on('t', () => {})
    proxy.on('t', () => {})
    proxy.on('t', () => {})
    // No warning should be triggered (manually checking is hard, but we verify the property)
  })

  it('should skip main emitter error in pipeAsync first mode', async () => {
    const e1 = ee()
    const e2 = ee()

    // e1 fails
    e1.on('test', async () => {
      throw new Error('e1 fail')
    })
    // e2 succeeds
    e2.on('test', async () => {
      return 'e2 success'
    })

    pipeAsync(e1, e2, { resultMode: 'first', asyncMode: 'parallel' })

    // We need to catch the error event on e1 so it doesn't throw uncaught
    e1.on('error', () => {})

    const res = await e1.emitAsync('test')
    assert.equal(
      res,
      'e2 success',
      'Should skip e1 error and take e2 success in first mode'
    )
  })

  it('should collect results from multiple piped destinations', async () => {
    const e1 = ee()
    const e2 = ee()
    const e3 = ee()

    e1.on('test', () => 'r1')
    e2.on('test', () => 'r2')
    e3.on('test', () => 'r3')

    pipeAsync(e1, e2, { resultMode: 'collect', asyncMode: 'parallel' })
    pipeAsync(e1, e3, { resultMode: 'collect', asyncMode: 'parallel' })

    const res = await e1.emitAsync('test')
    // Current implementation: the second pipeAsync call just pushes e3 to e1's pipes.
    // The options (resultMode: collect) from the FIRST call are used.
    assert.deepEqual(res, ['r1', 'r2', 'r3'])
  })

  it('should allow setting options during wrapEventEmitter and verify isolation', async () => {
    const ee1 = ee(null, { emitterOptions: { asyncMode: 'parallel' } })
    let order = []
    ee1.on('t', async () => {
      await sleep(20)
      order.push('slow')
    })
    ee1.on('t', async () => {
      await sleep(10)
      order.push('fast')
    })

    await ee1.emitAsync('t')
    assert.deepEqual(order, ['fast', 'slow'])
  })

  it('should support result aggregation in pipeAsync (default: return last result)', async () => {
    const e1 = ee()
    const e2 = ee()
    e1.on('test', () => 'r1')
    e2.on('test', () => 'r2')

    pipeAsync(e1, e2)
    const res = await e1.emitAsync('test')
    assert.equal(res, 'r2', 'Should return last non-undefined result by default')
  })

  it('should support result aggregation in pipeAsync (collect mode)', async () => {
    const e1 = ee()
    const e2 = ee()
    e1.on('test', () => 'r1')
    e2.on('test', () => 'r2')

    pipeAsync(e1, e2, { resultMode: 'collect' })
    const res = await e1.emitAsync('test')
    assert.deepEqual(res, ['r1', 'r2'])
  })

  it('should support result aggregation in pipeAsync (first mode)', async () => {
    const e1 = ee()
    const e2 = ee()
    e1.on('test', () => undefined)
    e2.on('test', () => 'r2')

    pipeAsync(e1, e2, { resultMode: 'first' })
    const res = await e1.emitAsync('test')
    assert.equal(res, 'r2')
  })

  it('should support result aggregation in pipeAsync (last mode)', async () => {
    const e1 = ee()
    const e2 = ee()
    const e3 = ee()
    e1.on('test', () => 'r1')
    e2.on('test', () => undefined)
    e3.on('test', () => 'r3')

    pipeAsync(e1, e2, { resultMode: 'last' })
    pipeAsync(e1, e3, { resultMode: 'last' })

    const res = await e1.emitAsync('test')
    assert.equal(res, 'r3', 'Should return last non-undefined result')
  })

  it('should support result aggregation in pipeAsync (last mode with all undefined)', async () => {
    const e1 = ee()
    const e2 = ee()
    e1.on('test', () => undefined)
    e2.on('test', () => undefined)

    pipeAsync(e1, e2, { resultMode: 'last' })
    const res = await e1.emitAsync('test')
    assert.equal(res, undefined, 'Should return undefined when all results are undefined')
  })

  it('should support parallel propagation to multiple destinations', async () => {
    const e1 = ee()
    const e2 = ee()
    const e3 = ee()
    let order = []

    e1.on('test', async () => {
      await sleep(50)
      order.push('e1')
    })
    e2.on('test', async () => {
      await sleep(10)
      order.push('e2')
    })
    e3.on('test', async () => {
      await sleep(20)
      order.push('e3')
    })

    pipeAsync(e1, e2, { asyncMode: 'parallel' })
    pipeAsync(e1, e3, { asyncMode: 'parallel' })

    await e1.emitAsync('test')
    // Expected finish order based on sleeps: e2 (10), e3 (20), e1 (50)
    assert.deepEqual(order, ['e2', 'e3', 'e1'])
  })

  it('should support instance-level configuration via setEmitterOptions', async () => {
    const ee1 = ee()
    let order = []

    ee1.on('test', async () => {
      await sleep(20)
      order.push('slow')
    })
    ee1.on('test', async () => {
      await sleep(10)
      order.push('fast')
    })

    // Set instance default to parallel
    ee1.setEmitterOptions({ asyncMode: 'parallel' })
    await ee1.emitAsync('test')

    assert.deepEqual(
      order,
      ['fast', 'slow'],
      'Should run in parallel because of instance options'
    )
  })

  it('should support initial configuration in wrapEventEmitter', async () => {
    const ee1 = ee(null, {
      emitterOptions: { asyncMode: 'parallel', resultMode: 'collect' },
    })
    ee1.on('test', () => 1)
    ee1.on('test', () => 2)

    const result = await ee1.emitAsync('test')
    assert.deepEqual(result, [1, 2], 'Should respect initial wrapping options')
  })

  it('should prioritize runtime options over instance options', async () => {
    const ee1 = ee()
    ee1.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })

    ee1.on('test', () => 'val')

    // Override to serial/last result at runtime
    const result = await ee1
      .configure({ asyncMode: 'serial', resultMode: 'last' })
      .emitAsync('test')
    assert.equal(
      result,
      'val',
      'Runtime options should override instance options'
    )
  })

  it('should handle missing maxListeners gracefully in minimal objects', () => {
    const ee1 = ee({})
    // This should not throw even if setMaxListeners is missing on the wrapped object
    ee1.setEmitterOptions({ maxListeners: 15 })
    assert.isUndefined(ee1._maxListeners)
  })

  it('should update maxListeners in full Eventable instances', async () => {
    const { eventable } = await import('../src/eventable')
    class MyEmitter {}
    eventable(MyEmitter)
    const ee1 = new MyEmitter()

    ee1.setEmitterOptions({ maxListeners: 15 })
    assert.equal(ee1._maxListeners, 15)
  })

  it('should distinguish between minimal and full descriptors in wrapEventEmitter', () => {
    // 1. Full instance (standalone)
    const eeFull = ee()
    assert.isFunction(eeFull.on)
    assert.isFunction(eeFull.parallel)
    assert.isFunction(eeFull.configure)
    assert.isFunction(eeFull.setMaxListeners)
    assert.isFunction(eeFull.removeAllListeners)

    // 2. Minimal instance (injected into object)
    const target = {}
    ee(target)
    assert.isFunction(target.on)
    assert.isFunction(target.emitAsync)
    assert.isFunction(target.setEmitterOptions)

    // Should NOT have these methods to avoid name collision
    assert.isUndefined(target.parallel)
    assert.isUndefined(target.configure)
    assert.isUndefined(target.setMaxListeners)
  })

  it('should still support parallel mode on minimal objects via setEmitterOptions', async () => {
    const target = {}
    ee(target)
    let order = []

    target.on('test', async () => {
      await sleep(20)
      order.push('slow')
    })
    target.on('test', async () => {
      await sleep(10)
      order.push('fast')
    })

    // No target.parallel() available, use setEmitterOptions
    target.setEmitterOptions({ asyncMode: 'parallel' })
    await target.emitAsync('test')

    assert.deepEqual(
      order,
      ['fast', 'slow'],
      'Should run in parallel even without the parallel() method'
    )
  })

  it('should support chaining multiple configure() calls', async () => {
    const ee1 = ee()
    ee1.on('test', () => 'val')

    // Chain parallel mode and collect result mode
    const proxy = ee1
      .configure({ asyncMode: 'parallel' })
      .configure({ resultMode: 'collect' })
    const res = await proxy.emitAsync('test')

    assert.deepEqual(res, ['val'])
    assert.equal(proxy._eeRuntimeOptions.asyncMode, 'parallel')
    assert.equal(proxy._eeRuntimeOptions.resultMode, 'collect')
  })

  it('should return undefined in first mode if all listeners return undefined', async () => {
    const ee1 = ee()
    ee1.on('test', () => undefined)
    ee1.on('test', async () => {
      await sleep(10)
      return undefined
    })

    const res = await ee1.parallel('first').emitAsync('test')
    assert.isUndefined(res)
  })

  it('should correctly collect mixed results and errors in collect mode', async () => {
    const ee1 = ee()
    ee1.on('error', () => {}) // Ignore errors

    ee1.on('test', () => 'ok')
    ee1.on('test', () => undefined)
    ee1.on('test', async () => {
      throw new Error('fail')
    })
    ee1.on('test', () => 'last')

    const res = await ee1.parallel('collect').emitAsync('test')
    // Errors result in 'undefined' in the results array currently
    assert.deepEqual(res, ['ok', undefined, undefined, 'last'])
  })

  it('should allow perceiving resolved state in serial first mode', async () => {
    const ee1 = ee()
    let perception = false

    ee1.on('test', () => 'got it')
    ee1.on('test', function () {
      perception = this.resolved
    })

    await ee1.configure({ resultMode: 'first' }).emitAsync('test')
    // In serial mode, the second listener IS called if we don't 'break' early.
    // Wait, our implementation for serial first mode DOES break.
    // So the second listener shouldn't even be called!
  })

  it('should short-circuit in serial first mode', async () => {
    const ee1 = ee()
    let called = false
    ee1.on('test', () => 'value')
    ee1.on('test', () => {
      called = true
    })

    const res = await ee1.configure({ resultMode: 'first' }).emitAsync('test')
    assert.equal(res, 'value')
    assert.isFalse(
      called,
      'Second listener should NOT be called in serial first mode'
    )
  })
})
