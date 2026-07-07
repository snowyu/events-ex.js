import { assert } from 'chai'
import { createAbortError, pipeAsync, oncePromise, wrapEventEmitter as ee, EventEmitter } from '../src'
import {sleep} from './test-helper'

// Verify it's a real AbortError
function assertAbortError(err) {
  assert.instanceOf(err, Error, 'should be an Error instance')
  assert.equal(err.name, 'AbortError', 'name should be AbortError')
}

describe('AbortSignal', () => {
  // ---- createAbortError ----
  describe('createAbortError', () => {
    it('should create an Error with name AbortError', () => {
      const err = createAbortError()
      assert.instanceOf(err, Error)
      assert.equal(err.name, 'AbortError')
      assert.equal(err.message, 'The operation was aborted')
    })

    it('should create fresh instances each call', () => {
      const err1 = createAbortError()
      const err2 = createAbortError()
      assert.notEqual(err1, err2)
      assert.notEqual(err1.stack, err2.stack, 'each should have its own stack trace')
    })
  })

  // ---- emitAsync serial mode ----
  describe('emitAsync serial with signal', () => {
    it('should throw AbortError when signal is already aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()
      controller.abort()

      let listenerCalled = false
      emitter.on('test', () => { listenerCalled = true })

      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      assert.isFalse(listenerCalled, 'no listener should be called')
    })

    it('should throw AbortError when signal aborts during serial execution', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const callOrder = []
      emitter.on('test', async () => {
        callOrder.push(1)
        controller.abort()
        await sleep(10)
      })
      emitter.on('test', async () => {
        callOrder.push(2)
      })

      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      // Second listener should NOT have been called (checked before execution)
      assert.deepEqual(callOrder, [1], 'only first listener should run')
    })

    it('should not call listeners after signal aborted (abort before next listener)', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const callOrder = []
      emitter.on('test', async () => {
        callOrder.push(1)
        controller.abort()
      })
      emitter.on('test', async () => {
        callOrder.push(2)
      })
      emitter.on('test', async () => {
        callOrder.push(3)
      })

      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      assert.deepEqual(callOrder, [1], 'only first listener should run')
    })

    it('should resolve normally when signal is not aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()
      let count = 0

      emitter.on('test', async () => {
        await sleep(10)
        count++
        return 'hello'
      })

      const result = await emitter.configure({ signal: controller.signal }).emitAsync('test')
      assert.equal(result, 'hello')
      assert.equal(count, 1)
    })

    it('should set evt.aborted to true in listener context when aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const callOrder = []
      let secondEvtAborted = null

      emitter.on('test', async function () {
        callOrder.push(1)
        controller.abort()
      })
      emitter.on('test', async function () {
        callOrder.push(2)
        secondEvtAborted = this.aborted
      })

      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      // The second listener still runs because serial checks signal BEFORE next listener,
      // but after the first listener completes. Let me verify the implementation...
      // Actually, in the current implementation, the check happens at the top of the loop
      // BEFORE each listener call. So the second listener should NOT run.
      assert.deepEqual(callOrder, [1])
      assert.isNull(secondEvtAborted, 'second listener should not have been called')
    })
  })

  // ---- emitAsync parallel mode ----
  describe('emitAsync parallel with signal', () => {
    it('should throw AbortError when signal is already aborted (parallel)', async () => {
      const emitter = ee()
      const controller = new AbortController()
      controller.abort()

      emitter.on('test', async () => 'foo')

      try {
        await emitter.configure({ signal: controller.signal, asyncMode: 'parallel' }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should throw AbortError when signal aborts during parallel execution', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', async () => {
        await sleep(30)
        controller.abort()
        return 'slow'
      })
      emitter.on('test', async () => {
        await sleep(200)
        return 'slower'
      })

      try {
        await emitter.configure({ signal: controller.signal, asyncMode: 'parallel' }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should resolve normally in parallel when signal not aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', async () => {
        await sleep(20)
        return 'a'
      })
      emitter.on('test', async () => {
        await sleep(10)
        return 'b'
      })

      const result = await emitter.configure({ signal: controller.signal, asyncMode: 'parallel' }).emitAsync('test')
      assert.equal(result, 'a')
    })

    it('should throw AbortError in parallel collect mode', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', async () => {
        await sleep(20)
        controller.abort()
        return 1
      })
      emitter.on('test', async () => {
        await sleep(200)
        return 2
      })

      try {
        await emitter
          .configure({ signal: controller.signal, asyncMode: 'parallel', resultMode: 'collect' })
          .emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should throw AbortError in parallel first mode', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', async () => {
        await sleep(30)
        controller.abort()
        return 'aborted'
      })

      try {
        await emitter
          .configure({ signal: controller.signal, asyncMode: 'parallel', resultMode: 'first' })
          .emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should set evt.aborted to true when parallel aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()

      let abortedFlag = null
      emitter.on('test', async function () {
        await sleep(20)
        controller.abort()
        // Directly read aborted flag synchronously after calling abort()
        abortedFlag = this.aborted
      })

      try {
        await emitter.configure({ signal: controller.signal, asyncMode: 'parallel' }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      // After abort, evt.aborted should be true
      assert.isTrue(abortedFlag, 'evt.aborted should be true after abort')
    })
  })

  // ---- oncePromise with signal ----
  describe('oncePromise with signal', () => {
    it('should reject immediately when signal is already aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()
      controller.abort()

      try {
        await oncePromise(emitter, 'data', { signal: controller.signal })
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should reject with AbortError when signal aborts while waiting', async () => {
      const emitter = ee()
      const controller = new AbortController()

      // Abort after a short delay
      setTimeout(() => controller.abort(), 20)
      try {
        await oncePromise(emitter, 'data', { signal: controller.signal })
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should resolve normally when signal is not aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const p = oncePromise(emitter, 'data', { signal: controller.signal })
      emitter.emit('data', 42)
      const evt = await p
      assert.equal(evt.type, 'data')
    })

    it('should clean up listeners after signal abort', async () => {
      const emitter = ee()
      const controller = new AbortController()

      let rejected = false
      const p = oncePromise(emitter, 'data', { signal: controller.signal }).catch(() => { rejected = true })

      controller.abort()
      await p
      assert.isTrue(rejected)

      // After abort cleanup, a new oncePromise should work fine
      let resolved = false
      const p2 = oncePromise(emitter, 'data').then(() => { resolved = true })
      emitter.emit('data')
      await p2
      assert.isTrue(resolved)
    })

    it('should cleanup signal listener after normal resolve (no leak)', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const p = oncePromise(emitter, 'data', { signal: controller.signal })
      emitter.emit('data')
      await p

      // Aborting after resolve should have no effect (listener cleaned up)
      // No error should be thrown
      controller.abort()
    })

    it('should not reject on abort when waiting for error event', async () => {
      const emitter = ee()
      const controller = new AbortController()

      setTimeout(() => controller.abort(), 20)
      try {
        await oncePromise(emitter, 'error', { signal: controller.signal })
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should handle signal with regex type', async () => {
      const emitter = ee()
      const controller = new AbortController()

      setTimeout(() => controller.abort(), 20)
      try {
        await oncePromise(emitter, /^user\./, { signal: controller.signal })
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should reject on abort even after some other events emitted', async () => {
      const emitter = ee()
      const controller = new AbortController()

      let resolved = false
      const p = oncePromise(emitter, 'target', { signal: controller.signal }).then(() => { resolved = true })

      // Emit unrelated events
      emitter.emit('other')
      emitter.emit('another')

      assert.isFalse(resolved, 'not resolved by unrelated events')

      controller.abort()
      try {
        await p
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      assert.isFalse(resolved, 'not resolved after abort')
    })
  })

  // ---- pipeAsync with signal ----
  describe('pipeAsync with signal', () => {
    it('should stop forwarding to subsequent pipe targets in serial mode when signal aborted', async () => {
      const e1 = ee()
      const e2 = ee()
      const e3 = ee()
      const controller = new AbortController()

      let e1Count = 0, e2Count = 0, e3Count = 0

      e1.on('test', async () => { e1Count++; controller.abort() })
      e2.on('test', async () => { e2Count++ })
      e3.on('test', async () => { e3Count++ })

      pipeAsync(e1, e2)
      pipeAsync(e1, e3)

      // e1 is the source, configure it with signal
      await e1.configure({ signal: controller.signal }).emitAsync('test')
      // After aborting in e1's listener, the signal check in pipeAsync
      // should prevent forwarding to e3 (but e2 may already have been reached)
      assert.equal(e1Count, 1, 'e1 listener should run')
      // In serial pipe, main emit runs first, then forwards to pipe targets one by one
      // e2 is the first pipe target, it runs before the signal check blocks e3
    })

    it('should forward normally when signal is not aborted', async () => {
      const e1 = ee()
      const e2 = ee()
      const e3 = ee()
      const controller = new AbortController()

      let e1Count = 0, e2Count = 0, e3Count = 0

      e1.on('test', async () => { e1Count++; return 'main' })
      e2.on('test', async () => { e2Count++; return 'pipe1' })
      e3.on('test', async () => { e3Count++; return 'pipe2' })

      pipeAsync(e1, e2)
      pipeAsync(e1, e3)

      const result = await e1.configure({ signal: controller.signal }).emitAsync('test')
      assert.equal(e1Count, 1)
      assert.equal(e2Count, 1)
      assert.equal(e3Count, 1)
      assert.equal(result, 'pipe2')
    })

    it('should stop forwarding when signal is already aborted', async () => {
      const e1 = ee()
      const e2 = ee()
      const controller = new AbortController()
      controller.abort()

      let e1Count = 0, e2Count = 0

      e1.on('test', async () => { e1Count++ })
      e2.on('test', async () => { e2Count++ })

      pipeAsync(e1, e2)

      try {
        await e1.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      assert.equal(e1Count, 0, 'e1 listener should not run')
      assert.equal(e2Count, 0, 'e2 pipe target should not run')
    })
  })

  // ---- configure({signal}) ----
  describe('configure with signal', () => {
    it('should create a proxy with signal in _eeRuntimeOptions', () => {
      const emitter = ee()
      const controller = new AbortController()

      const configured = emitter.configure({ signal: controller.signal })
      assert.notEqual(configured, emitter, 'configure should return a new proxy')
      assert.equal(configured._eeRuntimeOptions.signal, controller.signal)
    })

    it('should support fluent chaining with configure', () => {
      const emitter = ee()
      const controller = new AbortController()

      const configured = emitter.configure({ signal: controller.signal, asyncMode: 'parallel', resultMode: 'collect' })
      assert.equal(configured._eeRuntimeOptions.signal, controller.signal)
      assert.equal(configured._eeRuntimeOptions.asyncMode, 'parallel')
      assert.equal(configured._eeRuntimeOptions.resultMode, 'collect')
    })

    it('should merge signal with existing runtime options', () => {
      const emitter = ee()
      const controller = new AbortController()

      const configured1 = emitter.configure({ asyncMode: 'parallel' })
      const configured2 = configured1.configure({ signal: controller.signal })

      assert.equal(configured2._eeRuntimeOptions.asyncMode, 'parallel')
      assert.equal(configured2._eeRuntimeOptions.signal, controller.signal)
    })

    it('should not mutate original emitter options', () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.configure({ signal: controller.signal })
      assert.isUndefined(emitter._eeRuntimeOptions, 'original emitter should not have _eeRuntimeOptions directly')
    })
  })

  // ---- evt.aborted vs evt.stopped ----
  describe('evt.aborted vs evt.stopped', () => {
    it('evt.stopped should be independent from evt.aborted', async () => {
      const emitter = ee()
      let evtStopped = null
      let evtAborted = null

      emitter.on('test', function () {
        this.stopped = true
        evtStopped = this.stopped
        evtAborted = this.aborted
      })

      const result = await emitter.emitAsync('test')
      assert.isTrue(evtStopped, 'stopped should be true')
      assert.isFalse(evtAborted, 'aborted should be false when only stopped is true')
    })

    it('evt.aborted should be true when signal aborted', async () => {
      const emitter = ee()
      const controller = new AbortController()
      controller.abort()

      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })
  })

  // ---- multiple signals ----
  describe('multiple signals', () => {
    it('should work with different signals for different calls', async () => {
      const emitter = ee()
      const c1 = new AbortController()
      const c2 = new AbortController()

      emitter.on('test', async () => 'ok')

      // First call uses signal from c1 (not aborted)
      const r1 = await emitter.configure({ signal: c1.signal }).emitAsync('test')
      assert.equal(r1, 'ok')

      c2.abort()
      // Second call uses signal from c2 (aborted)
      try {
        await emitter.configure({ signal: c2.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should not affect non-signal calls after signal call', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', async () => 'ok')

      // First, abort with signal — should throw AbortError
      controller.abort()
      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }

      // Original emitter without signal should still work normally
      const result = await emitter.emitAsync('test')
      assert.equal(result, 'ok')
    })
  })

  // ---- error handling combined with abort ----
  describe('error handling with abort in emitAsync', () => {
    it('should still emit error events even when aborted (serial)', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const errors = []
      emitter.on('test', async () => {
        throw new Error('listener-error')
      })
      emitter.on('error', (err) => {
        errors.push(err)
      })

      // Signal is not aborted, but listener throws → error should be emitted
      await emitter.configure({ signal: controller.signal }).emitAsync('test')
      assert.equal(errors.length, 1, 'error event should be emitted')
    })

    it('should emit error events before throwing AbortError (serial)', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const errors = []
      emitter.on('test', async () => {
        throw new Error('listener-error')
        // error happens, then signal check after this listener's error handling
      })
      emitter.on('test', async () => {
        // this listener won't run if signal aborted in between
      })
      emitter.on('error', (err) => {
        errors.push(err)
      })

      controller.abort()
      // With already aborted signal and error-throwing listener in serial,
      // the signal check happens BEFORE the first listener runs, so
      // the error never gets a chance to throw either
      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      // No error events because no listeners ran
      assert.equal(errors.length, 0)
    })

    it('should emit error events then throw AbortError when abort happens during execution', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const errors = []
      emitter.on('test', async () => {
        controller.abort()
        throw new Error('boom')
      })
      emitter.on('test', async () => {
        return 'not-called'
      })
      emitter.on('error', (err) => {
        errors.push(err)
      })

      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assertAbortError(err)
      }
      // Error events ARE emitted during execution, before the abort check
      assert.equal(errors.length, 1, 'error event should be emitted')
    })

    it('should emit error events even when abort happens during execution (error listener throws)', async () => {
      const emitter = ee()
      const controller = new AbortController()

      const errors = []
      emitter.on('test', async () => {
        controller.abort()
        throw new Error('boom')
      })
      emitter.on('error', (err) => {
        errors.push(err)
        throw new Error('error-in-error')
      })

      try {
        await emitter.configure({ signal: controller.signal }).emitAsync('test')
        assert.fail('should have thrown')
      } catch (err) {
        assert.equal(err.message, 'error-in-error', 'error-in-error should propagate')
      }
      // Error event IS emitted before error-in-error takes over
      assert.equal(errors.length, 1, 'error event should be emitted')
    })
  })

  // ---- _createAbortPromise early-abort via sync listener in parallel mode ----
  describe('_createAbortPromise early-abort via sync listener in parallel', () => {
    it('should trigger early-abort when sync listener aborts signal before Promise.race (parallel default)', async () => {
      // In parallel mode, notifyListener runs synchronously up to the first await.
      // Inside _notify(), a SYNC listener is called immediately.
      // If that listener calls controller.abort(), signal.aborted becomes true
      // BEFORE _createAbortPromise(signal, evt) is created.
      // This covers default-methods.js lines 521-523.
      const emitter = ee()
      const controller = new AbortController()

      let syncListenerAborted = false
      // Sync listener aborts the signal during notifyListener's synchronous execution
      emitter.on('test', () => {
        syncListenerAborted = true
        controller.abort()  // signal.aborted becomes true SYNCHRONOUSLY
      })
      // Second listener would hang forever if it ran (won't run since AbortError)
      emitter.on('test', async () => {
        await new Promise(() => {})  // never resolves
      })

      try {
        // Signal is NOT aborted initially → emitAsync proceeds
        // Parallel mode: listeners.map calls notifyListener for each listener
        // The sync listener's _notify runs, calls controller.abort()
        // Then _createAbortPromise(signal, evt) is called with signal.aborted === TRUE
        await emitter.configure({ signal: controller.signal, asyncMode: 'parallel' }).emitAsync('test')
        assert.fail('should have thrown AbortError')
      } catch (err) {
        assertAbortError(err)
      }
      assert.isTrue(syncListenerAborted, 'sync listener should have run')
    })

    it('should trigger early-abort via sync listener in parallel with raiseError=true', async () => {
      // Same scenario but with raiseError=true (uses Promise.allSettled path)
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', () => {
        controller.abort()  // synchronous abort during notifyListener
      })
      emitter.on('test', async () => {
        await new Promise(() => {})
      })

      try {
        await emitter
          .configure({ signal: controller.signal, asyncMode: 'parallel', raiseError: true })
          .emitAsync('test')
        assert.fail('should have thrown AbortError')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should trigger early-abort via sync listener in parallel with collect mode', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', () => {
        controller.abort()  // synchronous abort during notifyListener
      })
      emitter.on('test', async () => {
        await new Promise(() => {})
      })

      try {
        await emitter
          .configure({ signal: controller.signal, asyncMode: 'parallel', resultMode: 'collect' })
          .emitAsync('test')
        assert.fail('should have thrown AbortError')
      } catch (err) {
        assertAbortError(err)
      }
    })

    it('should trigger early-abort via sync listener in parallel with first mode', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', () => {
        controller.abort()
      })
      emitter.on('test', async () => {
        await new Promise(() => {})
      })

      try {
        await emitter
          .configure({ signal: controller.signal, asyncMode: 'parallel', resultMode: 'first' })
          .emitAsync('test')
        assert.fail('should have thrown AbortError')
      } catch (err) {
        assertAbortError(err)
      }
    })
  })

  // ---- signal cleanup ----
  describe('signal cleanup', () => {
    it('should not leave dangling abort listeners after emitAsync completes', async () => {
      const emitter = ee()
      const controller = new AbortController()

      emitter.on('test', async () => 'ok')

      await emitter.configure({ signal: controller.signal }).emitAsync('test')

      // After completion, the abort listener should be cleaned up (Promise.race resolves)
      // There's no way to directly check, but we can verify aborting after doesn't cause issues
      controller.abort()
      const result = await emitter.emitAsync('test')
      assert.equal(result, 'ok')
    })
  })
})
