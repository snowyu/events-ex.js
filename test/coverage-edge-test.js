import {assert} from "chai"
import {EventEmitter, createAbortError} from '../src'
import {getEventableMethods} from '../src/default-methods'
import wrapEventEmitter from '../src/wrap-event-emitter'
import hasListeners from '../src/has-listeners'
import unify from '../src/unify'

/**
 * Tests for uncovered lines in default-methods.js and other source files.
 * Groups:
 *   1. _notify case 2 — emit with exactly 2 arguments
 *   2. _executeAsync errs loop with evt.type === 'error'
 *   3. Signal save/restore during async error re-emission
 *   4. createAbortError fresh instance (additional edge)
 */
describe('coverage edge cases', () => {

  // ================================================================
  // _notify case 2: emit event with exactly 2 listener arguments
  // ================================================================
  describe('_notify: emit with exactly 2 arguments', () => {
    it('should notify listener with 2 arguments via emit', () => {
      const e = new EventEmitter()
      let received
      e.on('data', function (a, b) { received = [a, b] })
      e.emit('data', 'arg1', 'arg2')
      assert.deepEqual(received, ['arg1', 'arg2'])
    })

    it('should notify listener with 2 arguments via emitAsync (serial)', async () => {
      const e = new EventEmitter()
      let received
      e.on('data', async function (a, b) { received = [a, b]; return 'ok' })
      const result = await e.emitAsync('data', 'val1', 'val2')
      assert.deepEqual(received, ['val1', 'val2'])
    })

    it('should notify listener with 2 arguments via emitAsync (parallel)', async () => {
      const e = new EventEmitter()
      let received
      e.on('data', async function (a, b) { received = [a, b]; return 'ok' })
      const result = await e.parallel().emitAsync('data', 'p1', 'p2')
      assert.deepEqual(received, ['p1', 'p2'])
    })
  })

  // ================================================================
  // _executeAsync errs loop: evt.type === 'error'
  // When an async 'error' event listener throws, the error is pushed to
  // errs. After the listener loop, errs is processed and if evt.type === 'error',
  // the error is thrown directly (not re-emitted to avoid recursion).
  // ================================================================
  describe('async error-in-error propagation (evt.type === "error" in errs loop)', () => {
    it('should throw when async error listener throws in emitAsync', async () => {
      const e = new EventEmitter()
      let errorCalls = 0
      e.on('error', async () => { errorCalls++; throw new Error('error-in-error') })

      try {
        await e.emitAsync('error', new Error('original'))
        assert.fail('should have thrown error-in-error')
      } catch (err) {
        // Should propagate the error from the error listener's throw
        assert.equal(err.message, 'error-in-error', 'should propagate error-in-error')
      }
      assert.equal(errorCalls, 1, 'error listener should be called exactly once')
    })

    it('should throw when sync error listener throws in emitAsync on error event', async () => {
      const e = new EventEmitter()
      let errorCalls = 0
      e.on('error', () => { errorCalls++; throw new Error('sync-error-in-error') })

      try {
        await e.emitAsync('error', new Error('original'))
        assert.fail('should have thrown')
      } catch (err) {
        assert.equal(err.message, 'sync-error-in-error')
      }
      assert.equal(errorCalls, 1)
    })

    it('should not loop infinitely when multiple error listeners each throw', async () => {
      const e = new EventEmitter()
      let callCount = 0
      e.on('error', async () => { callCount++; throw new Error('err1') })
      e.on('error', async () => { callCount++; throw new Error('err2') })

      try {
        await e.emitAsync('error', new Error('original'))
        assert.fail('should have thrown')
      } catch (err) {
        // Either err1 or err2 could be thrown first
        assert.isTrue(err.message === 'err1' || err.message === 'err2')
      }
      // Each error listener ran once
      assert.equal(callCount, 2, 'both error listeners should be called')
    })
  })

  // ================================================================
  // Signal save/restore during async error re-emission
  // When there's an active signal and listener errors are re-emitted,
  // the signal is temporarily cleared so error re-emission is not blocked.
  // ================================================================
  describe('signal save/restore during async error re-emission', () => {
    it('should save and restore signal when re-emitting errors in async', async () => {
      const e = new EventEmitter()
      const controller = new AbortController()

      // This listener will throw, triggering error re-emission
      e.on('data', async () => { throw new Error('listener-error') })

      // Register an error listener that will receive the re-emitted error
      let errorReceived = false
      e.on('error', (err) => {
        errorReceived = true
        assert.equal(err.message, 'listener-error')
      })

      // Use configure with signal. The error re-emission should work
      // despite the signal being present (it gets saved/restored).
      await e.configure({ signal: controller.signal }).emitAsync('data')
      assert.isTrue(errorReceived, 'error should be re-emitted despite signal')
    })

    it('should restore signal after error re-emission so subsequent emits are still blocked', async () => {
      const e = new EventEmitter()
      const controller = new AbortController()

      let errorReceived = false
      e.on('data', async () => { throw new Error('first-error') })
      e.on('error', (err) => { errorReceived = true })

      // Emit with signal that gets aborted mid-execution
      await e.configure({ signal: controller.signal }).emitAsync('data')
      assert.isTrue(errorReceived, 'error should be re-emitted')

      // Now abort the signal
      controller.abort()

      // Subsequent emitAsync with the (now aborted) signal should throw AbortError
      try {
        await e.configure({ signal: controller.signal }).emitAsync('data')
        assert.fail('should have thrown AbortError')
      } catch (err) {
        assert.equal(err.name, 'AbortError', 'signal should still be respected')
      }
    })

    it('should handle multiple error re-emissions with signal', async () => {
      const e = new EventEmitter()
      const controller = new AbortController()

      const errors = []
      e.on('data', async () => { throw new Error('err1') })
      e.on('data', async () => { throw new Error('err2') })
      e.on('error', (err) => { errors.push(err.message) })

      // Two listeners throw, both errors should be re-emitted
      await e.configure({ signal: controller.signal }).emitAsync('data')
      assert.deepEqual(errors, ['err1', 'err2'], 'both listener errors should be re-emitted')
    })
  })

  // ================================================================
  // createAbortError
  // ================================================================
  describe('createAbortError', () => {
    it('should create fresh Error instances each call', () => {
      const err1 = createAbortError()
      const err2 = createAbortError()
      assert.notEqual(err1, err2)
      assert.notEqual(err1.stack, err2.stack, 'each should have its own stack trace')
      assert.equal(err1.name, 'AbortError')
      assert.equal(err2.name, 'AbortError')
    })
  })

  // ================================================================
  // hasListeners: uncovered branch
  // ================================================================
  describe('hasListeners edge cases', () => {
    it('should check with type where obj has _events but not the specific type', () => {
      const x = wrapEventEmitter()
      x.on('foo', () => {}) // has _events.foo
      // Check with type that exists
      assert.isOk(hasListeners(x, 'foo'))
      // Check with type that doesn't exist (covers the second condition in the && chain)
      assert.isNotOk(hasListeners(x, 'nonexistent'), 'should be false for non-existent type')
      // Check without type on emitter with events
      assert.isOk(hasListeners(x), 'should be true when emitter has events')
    })

    it('should throw TypeError for null or undefined', () => {
      assert.throws(() => hasListeners(null), TypeError)
      assert.throws(() => hasListeners(undefined), TypeError)
    })

    it('should throw TypeError for non-function listener in on()', () => {
      const e = new EventEmitter()
      assert.throws(() => e.on('data', 'not-a-function'), TypeError)
      assert.throws(() => e.on('data', 123), TypeError)
      assert.throws(() => e.on('data', null), TypeError)
    })
  })

  // ================================================================
  // resultMode 'collect' with throwing listener (line 635 in default-methods.js)
  // ================================================================
  describe('collect resultMode with throwing listener', () => {
    it('should push undefined for errored listener in collect mode', async () => {
      const e = new EventEmitter()
      e.on('data', async () => { throw new Error('err1') })
      e.on('data', async () => 'ok')

      const result = await e.configure({ resultMode: 'collect' }).emitAsync('data')
      assert.deepEqual(result, [undefined, 'ok'], 'first listener error becomes undefined in collect')
    })

    it('should push undefined for errored listener in collect mode (all error)', async () => {
      const e = new EventEmitter()
      e.on('data', async () => { throw new Error('err1') })
      e.on('data', async () => { throw new Error('err2') })

      const result = await e.configure({ resultMode: 'collect' }).emitAsync('data')
      assert.deepEqual(result, [undefined, undefined], 'all errors become undefined')
    })
  })

  // ================================================================
  // unify merge: line 45 in unify.js — both emitters have array listeners for same event
  // ================================================================
  describe('unify merge with arrays', () => {
    it('should merge when both emitters have multiple listeners for the same event', () => {
      const x = new EventEmitter()
      const y = new EventEmitter()
      let cx = 0, cy = 0
      x.on('foo', () => { cx++ })
      x.on('foo', () => { cx++ })  // x._events.foo = [fn, fn]
      y.on('foo', () => { cy++ })
      y.on('foo', () => { cy++ })  // y._events.foo = [fn, fn]

      unify(x, y)
      x.emit('foo')
      // Both x and y listeners should fire
      assert.equal(cx, 2, 'x listeners should fire')
      assert.equal(cy, 2, 'y listeners should fire (already merged)')
    })
  })

  // ================================================================
  // setEmitterOptions called twice: line 58 — else branch (data = this._emitterOptions)
  // ================================================================
  describe('setEmitterOptions called twice', () => {
    it('should reuse existing _emitterOptions on second call', () => {
      const e = new EventEmitter()
      // First call: creates _emitterOptions (if branch, already covered)
      e.setEmitterOptions({ asyncMode: 'parallel' })
      // Second call: reuses existing _emitterOptions (else branch, line 58)
      e.setEmitterOptions({ resultMode: 'collect' })
      // Verify both options are stored in _emitterOptions
      assert.equal(e._emitterOptions.asyncMode, 'parallel')
      assert.equal(e._emitterOptions.resultMode, 'collect')
    })
  })

  // ================================================================
  // removeAllListeners with regex type: line 380 — data = regExpEvents
  // ================================================================
  describe('removeAllListeners with regex type', () => {
    it('should remove regex listeners by regex type (fast path, no removeListener)', () => {
      const e = new EventEmitter()
      let called = false
      e.on(/^foo/, () => { called = true })
      e.removeAllListeners(/^foo/)
      e.emit('foobar')
      assert.isFalse(called, 'listener should be removed')
    })

    it('should not affect non-matching events after regex removal', () => {
      const e = new EventEmitter()
      let fooCalled = false, barCalled = false
      e.on(/^foo/, () => { fooCalled = true })
      e.on(/^bar/, () => { barCalled = true })
      e.removeAllListeners(/^foo/)
      e.emit('barrel')
      assert.isFalse(fooCalled, 'foo listener should be removed')
      assert.isTrue(barCalled, 'bar listener should still fire')
    })
  })

  // ================================================================
  // _emit regex matching: lines 477-480 in default-methods.js
  // When regex events are registered and a matching event is emitted,
  // the regex listeners are accumulated into the matched array.
  // ================================================================
  describe('_emit regex matching branches', () => {
    it('should aggregate regex listeners from an array of regex listeners', () => {
      const e = new EventEmitter()
      let callOrder = []
      e.on(/^foo/, () => { callOrder.push('f1') })
      e.on(/^foo/, () => { callOrder.push('f2') }) // stored as array
      e.emit('foobar')
      assert.deepEqual(callOrder, ['f1', 'f2'], 'both regex listeners should fire')
    })

    it('should aggregate regex listener from a single regex listener', () => {
      const e = new EventEmitter()
      let called = false
      e.on(/^bar/, () => { called = true })
      e.emit('barnone')
      assert.isTrue(called, 'single regex listener should fire')
    })

    it('should combine regular listeners with regex matching listeners', () => {
      const e = new EventEmitter()
      let callOrder = []
      e.on('foo', () => { callOrder.push('exact') })
      e.on(/^foo/, () => { callOrder.push('regex') })
      e.emit('foo')
      // Both the exact match and regex match should fire
      assert.deepEqual(callOrder, ['exact', 'regex'])
    })

    it('should not fire regex listeners that do not match the event', () => {
      const e = new EventEmitter()
      let called = false
      e.on(/^bar/, () => { called = true })
      e.emit('foo')
      assert.isFalse(called, 'regex should not fire for non-matching event')
    })

    it('should work with no regular listeners and only regex matches', () => {
      const e = new EventEmitter()
      let called = false
      e.on(/^test/, () => { called = true })
      e.emit('testing')
      assert.isTrue(called)
    })
  })

  // ================================================================
  // default-methods line 450: _emit raiseError=true with non-Error message
  // ================================================================
  describe('_emit: raiseError=true wraps non-Error message', () => {
    it('should wrap non-Error message in Error when raiseError is true', () => {
      const e = new EventEmitter()
      e.setEmitterOptions({ raiseError: true })
      assert.throws(() => {
        e.emit('error', 'something went wrong')
      }, /Uncaught, unspecified 'error' event/)
    })

    it('should NOT wrap when message is already an Error (raiseError=true)', () => {
      const e = new EventEmitter()
      e.setEmitterOptions({ raiseError: true })
      const orig = new Error('already-an-error')
      assert.throws(() => {
        e.emit('error', orig)
      }, /already-an-error/)
    })
  })

  // ================================================================
  // default-methods line 462: _emit default raiseError wraps non-Error message with no listener
  // ================================================================
  describe('_emit: default raiseError wraps non-Error message without listeners', () => {
    it('should wrap non-Error message in Error when no error listeners exist', () => {
      const e = new EventEmitter()
      assert.throws(() => {
        e.emit('error', 'custom error')
      }, /Uncaught, unspecified 'error' event/)
    })

    it('should NOT wrap when message is already an Error (no error listeners)', () => {
      const e = new EventEmitter()
      const orig = new Error('existing-error')
      assert.throws(() => {
        e.emit('error', orig)
      }, /existing-error/)
    })
  })

  // ================================================================
  // default-methods lines 596-597: parallel raiseError=true with throwing listeners (no signal)
  // ================================================================
  describe('_executeAsync: parallel raiseError=true throws on listener errors', () => {
    it('should throw single error when one parallel listener fails with raiseError=true', async () => {
      const e = new EventEmitter()
      e.on('data', async () => { throw new Error('single-error') })

      try {
        await e.configure({ asyncMode: 'parallel', raiseError: true }).emitAsync('data')
        assert.fail('should have thrown')
      } catch (err) {
        assert.equal(err.message, 'single-error', 'single rejection should throw the error directly')
      }
    })

    it('should throw AggregateError when multiple parallel listeners fail with raiseError=true', async () => {
      const e = new EventEmitter()
      e.on('data', async () => { throw new Error('err1') })
      e.on('data', async () => { throw new Error('err2') })

      try {
        await e.configure({ asyncMode: 'parallel', raiseError: true }).emitAsync('data')
        assert.fail('should have thrown')
      } catch (err) {
        assert.instanceOf(err, AggregateError, 'multiple rejections should throw AggregateError')
        assert.lengthOf(err.errors, 2, 'should contain both errors')
      }
    })

    it('should resolve normally when all parallel listeners succeed (raiseError=true)', async () => {
      const e = new EventEmitter()
      let callCount = 0
      e.on('data', async () => { callCount++; return 'ok1' })
      e.on('data', async () => { callCount++; return 'ok2' })

      const result = await e.configure({ asyncMode: 'parallel', raiseError: true }).emitAsync('data')
      assert.equal(callCount, 2, 'both listeners should be called')
      assert.equal(result, 'ok2', 'should return last result')
    })
  })

  // ================================================================
  // default-methods line 324: off() early return when _events does not exist
  // EventEmitter constructor always sets _events, so we must use
  // the raw method from getEventableMethods on a bare object.
  // ================================================================
  describe('off: early return when no _events', () => {
    it('should return self when off() is called on an object without _events', () => {
      const methods = getEventableMethods(EventEmitter)
      const bareObj = {}
      const result = methods.off.call(bareObj, 'data', function () {})
      assert.strictEqual(result, bareObj, 'should return the object for chaining')
    })
  })

  // ================================================================
  // default-methods line 369: removeAllListeners() early return when _events does not exist
  // ================================================================
  describe('removeAllListeners: early return when no _events', () => {
    it('should return self when removeAllListeners is called on an object without _events', () => {
      const methods = getEventableMethods(EventEmitter)
      const bareObj = {}
      const result = methods.removeAllListeners.call(bareObj, 'data')
      assert.strictEqual(result, bareObj, 'should return the object for chaining')
    })
  })

  // ================================================================
  // default-methods line 120: on() numeric index with existing listeners
  // The `!isNaN(index)` condition in `typeof index === 'number' && !isNaN(index)`
  // needs the `false` branch exercised by passing NaN as index to an emitter
  // that already has listeners for the type.
  // ================================================================
  describe('on: numeric index branch with existing listeners', () => {
    it('should handle NaN index the same as undefined (fall through to else)', () => {
      const e = new EventEmitter()
      const results = []
      // Add 'first' and 'last' listeners first so data[type] exists
      e.on('data', () => results.push('first'), 'first')
      e.on('data', () => results.push('last'), 'last')
      // NaN index: typeof number === true, but !isNaN(NaN) is false → else branch
      e.on('data', () => results.push('nan'), NaN)
      e.emit('data')
      assert.deepEqual(results, ['first', 'nan', 'last'], 'NaN index should go to body end')
    })
  })

  // ================================================================
  // default-methods line 258: emitAsync raiseError=null with non-Error message
  // Covers the `err instanceof Error ? err : new Error(UnCAUGHT_ERR)` false branch.
  // Need an error listener that does NOT throw, so _executeAsync completes normally
  // and line 258 is reached. Then emit a non-Error so the ternary wraps it.
  // ================================================================
  describe('emitAsync: raiseError=null with non-Error message', () => {
    it('should wrap non-Error message when raiseError is null in emitAsync', async () => {
      const e = new EventEmitter()
      let errorHandled = false
      // Error listener that handles without throwing
      e.on('error', () => { errorHandled = true })
      e.setEmitterOptions({ raiseError: null })

      try {
        // Emit a string, not an Error — covers the 'err instanceof Error' ternary's false branch
        await e.emitAsync('error', 'string-error')
        assert.fail('should have thrown')
      } catch (err) {
        assert.isTrue(errorHandled, 'error listener should have been called')
        // When err is not an Error instance: new Error(UnCAUGHT_ERR) with no appended message
        assert.equal(err.message, "Uncaught, unspecified 'error' event.", "should wrap with default UnCAUGHT_ERR")
      }
    })
  })

  // ================================================================
  // default-methods line 52: setEmitterOptions with non-object
  // ================================================================
  describe('setEmitterOptions: non-object returns early', () => {
    it('should return self when options is not an object', () => {
      const e = new EventEmitter()
      const r1 = e.setEmitterOptions()
      assert.strictEqual(r1, e, 'no args should return self')
      const r2 = e.setEmitterOptions(null)
      assert.strictEqual(r2, e, 'null should return self')
    })
  })

  // ================================================================
  // default-methods line 163: once() with non-function listener
  // ================================================================
  describe('once: non-function listener throws TypeError', () => {
    it('should throw TypeError when listener is not a function', () => {
      const e = new EventEmitter()
      assert.throws(() => e.once('data', 'not-a-function'), TypeError)
      assert.throws(() => e.once('data', null), TypeError)
      assert.throws(() => e.once('data', 123), TypeError)
    })
  })

  // ================================================================
  // default-methods line 220: emit() finally block wraps non-Error value
  // Ternary: `err instanceof Error ? err : new Error(UnCAUGHT_ERR)` — false branch
  // ================================================================
  describe('emit: finally block wraps non-Error error value', () => {
    it('should wrap string error value via ternary false branch in sync emit', () => {
      const e = new EventEmitter()
      let errorHandled = false
      // Non-throwing error listener so try block completes normally
      e.on('error', () => { errorHandled = true })
      // raiseError must be explicitly set to null; the default is undefined
      e.setEmitterOptions({ raiseError: null })
      // raiseError=null + non-Error message + listener exists
      // → finally block: r.type==='error' && opts.raiseError===null → wraps with new Error(UnCAUGHT_ERR)
      assert.throws(() => {
        e.emit('error', 'string-error')
      }, /Uncaught, unspecified 'error' event/)
      assert.isTrue(errorHandled, 'error listener should have been called')
    })
  })

  // ================================================================
  // default-methods line 277: listeners() when no _events exists
  // ================================================================
  describe('listeners: no _events returns empty array', () => {
    it('should return empty array when _events does not exist', () => {
      // Use raw method on bare object without _events
      const methods = getEventableMethods(EventEmitter)
      const bareObj = {}
      const result = methods.listeners.call(bareObj, 'foo')
      assert.deepEqual(result, [])
    })
  })

  // ================================================================
  // default-methods line 323: off() with non-function listener
  // ================================================================
  describe('off: non-function listener throws TypeError', () => {
    it('should throw TypeError when listener is not a function', () => {
      const e = new EventEmitter()
      assert.throws(() => e.off('data', 'not-a-function'), TypeError)
      assert.throws(() => e.off('data', null), TypeError)
      assert.throws(() => e.off('data', 123), TypeError)
    })
  })
})
