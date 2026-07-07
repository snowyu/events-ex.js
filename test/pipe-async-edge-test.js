import {assert} from "chai"

import pipeAsync from '../src/pipe-async'
import {createConfigurableEmitter} from './test-helper'

describe('pipe-async edge cases', () => {
  it('should fallback to emitAsync when custom method name not found on target', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    let e1Count = 0, e2Count = 0
    e1.on('test', async () => { e1Count++; return 'e1' })
    e2.on('test', async () => { e2Count++; return 'e2' })

    // 'customEmit' doesn't exist on e2, should fallback to target.emitAsync
    // The pipe creates a 'customEmit' method on e1. Calling it should forward to e2
    // via emitAsync fallback.
    pipeAsync(e1, e2, 'customEmit')
    const result = await e1.customEmit('test')
    assert.equal(e1Count, 1, 'e1 listener should run')
    assert.equal(e2Count, 1, 'e2 pipe target should receive via emitAsync fallback')
  })

  it('should pipe-async with own property descriptor', async () => {
    // When methods are own configurable properties, getOwnPropertyDescriptor returns a descriptor
    // → enters else block: delete desc.get; delete desc.set (lines 51-52)
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    let c1 = 0, c2 = 0
    e1.on('test', async () => { c1++; return 'a' })
    e2.on('test', async () => { c2++; return 'b' })

    pipeAsync(e1, e2)
    const result = await e1.emitAsync('test')
    assert.equal(c1, 1)
    assert.equal(c2, 1)
  })

  it('should forward in parallel mode with multiple targets', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    const e3 = createConfigurableEmitter()
    let c1 = 0, c2 = 0, c3 = 0
    e1.on('test', async () => { c1++; return 'a' })
    e2.on('test', async () => { c2++; return 'b' })
    e3.on('test', async () => { c3++; return 'c' })

    // The pipe function's asyncMode comes from its own closure, not from configure().
    // Must pass asyncMode in the pipe options.
    pipeAsync(e1, e2, { asyncMode: 'parallel' })
    pipeAsync(e1, e3, { asyncMode: 'parallel' })

    const result = await e1.emitAsync('test')
    assert.equal(c1, 1)
    assert.equal(c2, 1)
    assert.equal(c3, 1)
  })

  it('should forward in serial mode with multiple targets', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    const e3 = createConfigurableEmitter()
    let c1 = 0, c2 = 0, c3 = 0
    e1.on('test', async () => { c1++; return 'a' })
    e2.on('test', async () => { c2++; return 'b' })
    e3.on('test', async () => { c3++; return 'c' })

    pipeAsync(e1, e2)
    pipeAsync(e1, e3)

    const result = await e1.emitAsync('test')
    assert.equal(c1, 1)
    assert.equal(c2, 1)
    assert.equal(c3, 1)
  })

  it('should return collect results from pipe chain in serial mode', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    e1.on('test', async () => 'main')
    e2.on('test', async () => 'pipe-target')

    // The resultMode for pipeAsync is set on the pipe options, not on configure
    pipeAsync(e1, e2, { resultMode: 'collect' })
    const result = await e1.emitAsync('test')
    assert.deepEqual(result, ['main', 'pipe-target'])
  })

  it('should return first non-undefined result from pipe chain in serial mode', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    const e3 = createConfigurableEmitter()
    e1.on('test', async () => undefined)
    e2.on('test', async () => 'first-result')
    e3.on('test', async () => 'should-not-reach')

    // Only the FIRST pipeAsync call creates the pipe function closure with options.
    // Subsequent calls just push to the pipes array, their options are discarded.
    pipeAsync(e1, e2, { resultMode: 'first' })
    pipeAsync(e1, e3)
    const result = await e1.emitAsync('test')
    assert.equal(result, 'first-result')
  })

  it('should fallback to raw emit when target has neither name method nor emitAsync', async () => {
    // When forward() is called and target[name] AND target.emitAsync are both
    // undefined, it falls through to `emit` (the raw methods.emitAsync).
    // This covers the `|| emit` fallback on line 60 in pipe-async.js.
    const e1 = createConfigurableEmitter()
    const plainTarget = {}  // No emitter methods at all — no on, no emitAsync
    let e1Count = 0
    e1.on('test', async () => { e1Count++; return 'from-e1' })

    // Pipe to the plain object using a custom name.
    // forward() will check: target['customEmit'] (undefined)
    // → target.emitAsync (undefined)
    // → emit (methods.emitAsync) → call on plain object (harmless)
    pipeAsync(e1, plainTarget, 'customEmit')
    const result = await e1.customEmit('test')
    assert.equal(e1Count, 1, 'e1 listener should run')
    // Default 'last' result mode: returns e1's result ('from-e1')
    assert.equal(result, 'from-e1', 'should return main emitter result')
  })

  it('should handle pipeAsync close with multiple targets', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    const e3 = createConfigurableEmitter()
    let c2 = 0, c3 = 0
    e2.on('test', async () => { c2++ })
    e3.on('test', async () => { c3++ })

    const pipe1 = pipeAsync(e1, e2)
    pipeAsync(e1, e3)

    await e1.emitAsync('test')
    assert.equal(c2, 1)
    assert.equal(c3, 1)

    pipe1.close()
    await e1.emitAsync('test')
    assert.equal(c2, 1, 'e2 should not receive after close')
    assert.equal(c3, 2, 'e3 should still receive')
  })

  it('should return last non-undefined from parallel pipe chain', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    const e3 = createConfigurableEmitter()
    e1.on('test', async () => 'main')
    e2.on('test', async () => undefined)
    e3.on('test', async () => 'last')

    pipeAsync(e1, e2, { asyncMode: 'parallel' })
    pipeAsync(e1, e3, { asyncMode: 'parallel' })
    const result = await e1.emitAsync('test')
    assert.equal(result, 'last')
  })

  it('should return first from parallel pipe chain', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    const e3 = createConfigurableEmitter()
    e1.on('test', async () => undefined)
    e2.on('test', async () => 'first')
    e3.on('test', async () => 'last')

    pipeAsync(e1, e2, { asyncMode: 'parallel', resultMode: 'first' })
    pipeAsync(e1, e3, { asyncMode: 'parallel', resultMode: 'first' })
    const result = await e1.emitAsync('test')
    assert.equal(result, 'first')
  })

  it('should return collect from parallel pipe chain', async () => {
    const e1 = createConfigurableEmitter()
    const e2 = createConfigurableEmitter()
    const e3 = createConfigurableEmitter()
    e1.on('test', async () => 'a')
    e2.on('test', async () => 'b')
    e3.on('test', async () => 'c')

    pipeAsync(e1, e2, { asyncMode: 'parallel', resultMode: 'collect' })
    pipeAsync(e1, e3, { asyncMode: 'parallel', resultMode: 'collect' })
    const result = await e1.emitAsync('test')
    assert.deepEqual(result, ['a', 'b', 'c'])
  })
})
