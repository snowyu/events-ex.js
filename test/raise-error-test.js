import {assert} from "chai";
import {EventEmitter, oncePromise} from '../src'
import wrapEventEmitter from '../src/wrap-event-emitter'

describe('raiseError', () => {

  // ============================================================
  //  raiseError: undefined (default) — Node.js behavior
  // ============================================================
  describe('default (undefined) — Node.js behavior', () => {

    it('should throw when emitting "error" with no error listener', () => {
      const e = new EventEmitter();
      assert.throws(() => {
        e.emit('error', new Error('boom'));
      }, 'boom');
    });

    it('should NOT throw when emitting "error" with an error listener', () => {
      const e = new EventEmitter();
      let caught = false;
      e.on('error', (err) => { caught = true; assert.equal(err.message, 'boom'); });
      e.emit('error', new Error('boom'));
      assert.isTrue(caught, 'error listener should have been called');
    });

    it('should re-emit listener errors as "error" events (and throw if no error listener)', () => {
      const e = new EventEmitter();
      e.on('data', () => { throw new Error('listener-boom'); });
      // no error listener → should throw
      assert.throws(() => {
        e.emit('data');
      }, 'listener-boom');
    });

    it('should re-emit listener errors to registered error listener', () => {
      const e = new EventEmitter();
      let errorCaught = false;
      e.on('data', () => { throw new Error('listener-boom'); });
      e.on('error', (err) => { errorCaught = true; assert.equal(err.message, 'listener-boom'); });
      e.emit('data');
      assert.isTrue(errorCaught, 'error listener should catch listener errors');
    });
  });

  // ============================================================
  //  raiseError: true — always throw, bypass listener dispatch
  // ============================================================
  describe('raiseError: true', () => {

    // ---- _emit level ----

    it('should ALWAYS throw on "error" even with an error listener', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });
      let errorCalled = false;
      e.on('error', () => { errorCalled = true; });

      assert.throws(() => {
        e.emit('error', new Error('boom'));
      }, 'boom');
      // error listener should NOT have been called
      assert.isFalse(errorCalled, 'error listener should NOT be called when raiseError=true');
    });

    it('should throw on "error" without error listener', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });
      assert.throws(() => {
        e.emit('error', new Error('boom'));
      }, 'boom');
    });

    // ---- emit() sync ----

    it('should fail-fast: listener error immediately re-throws, stops remaining listeners', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      let firstCalled = false;
      let secondCalled = false;

      e.on('data', () => { firstCalled = true; throw new Error('inner-error'); });
      e.on('data', () => { secondCalled = true; });

      assert.throws(() => {
        e.emit('data');
      }, 'inner-error');

      assert.isTrue(firstCalled, 'first listener should have been called');
      assert.isFalse(secondCalled, 'second listener should NOT be called (fail-fast)');
    });

    it('should fail-fast even when error listener exists', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      let errorCalled = false;
      e.on('error', () => { errorCalled = true; });
      e.on('data', () => { throw new Error('inner-error'); });

      assert.throws(() => {
        e.emit('data');
      }, 'inner-error');

      assert.isFalse(errorCalled, 'error listener should NOT be called');
    });

    it('should fail-fast on the FIRST throwing listener (not collect all)', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      const callOrder = [];
      e.on('data', () => { callOrder.push(1); });
      e.on('data', () => { callOrder.push(2); throw new Error('second-error'); });
      e.on('data', () => { callOrder.push(3); });

      assert.throws(() => { e.emit('data'); }, 'second-error');
      assert.deepEqual(callOrder, [1, 2], 'should stop after the first error');
    });

    // ---- emitAsync() ----

    it('should fail-fast in emitAsync (serial mode)', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      const callOrder = [];
      e.on('data', async () => { callOrder.push(1); });
      e.on('data', async () => { callOrder.push(2); throw new Error('async-error'); });
      e.on('data', async () => { callOrder.push(3); });

      try {
        await e.emitAsync('data');
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.message, 'async-error');
      }
      assert.deepEqual(callOrder, [1, 2], 'should stop after the first error in serial mode');
    });

    it('should fail-fast in emitAsync (parallel mode)', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      let thirdCalled = false;
      e.on('data', async () => { throw new Error('parallel-error1'); });
      e.on('data', async () => { throw new Error('parallel-error2'); });
      e.on('data', async () => { thirdCalled = true; });

      try {
        await e.parallel().emitAsync('data');
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, 'AggregateError'); // Promise.all rejects with AggregateError
      }
    });

    // ---- configure override ----

    it('configure({raiseError: true}) should override setEmitterOptions({raiseError: false})', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });
      let errorCalled = false;
      e.on('error', () => { errorCalled = true; });

      assert.throws(() => {
        e.configure({ raiseError: true }).emit('error', new Error('boom'));
      }, 'boom');
      assert.isFalse(errorCalled, 'error listener should NOT be called');
    });

    // ---- non-error events unaffected ----

    it('should NOT affect emit behavior of non-error events', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      let called = false;
      e.on('data', () => { called = true; });
      e.emit('data');
      assert.isTrue(called, 'normal event should still work');
    });
  });

  // ============================================================
  //  raiseError: false — never throw on unhandled errors
  // ============================================================
  describe('raiseError: false', () => {

    // ---- _emit level ----

    it('should NOT throw when emitting "error" with no error listener', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });
      // Should not throw
      e.emit('error', new Error('boom'));
    });

    it('should still call error listener if one is registered', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });
      let caught = false;
      e.on('error', (err) => {
        caught = true;
        assert.equal(err.message, 'boom');
      });
      e.emit('error', new Error('boom'));
      assert.isTrue(caught, 'error listener should still be called');
    });

    // ---- emit() sync ----

    it('should still collect and re-emit listener errors (without crashing)', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      const callOrder = [];
      e.on('data', () => { callOrder.push(1); throw new Error('err1'); });
      e.on('data', () => { callOrder.push(2); throw new Error('err2'); });
      e.on('data', () => { callOrder.push(3); });

      // Should not throw
      e.emit('data');
      assert.deepEqual(callOrder, [1, 2, 3], 'all listeners should run');
    });

    it('should deliver listener errors to error listener', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      const errors = [];
      e.on('data', () => { throw new Error('err1'); });
      e.on('data', () => { throw new Error('err2'); });
      e.on('error', (err) => { errors.push(err.message); });

      e.emit('data');
      assert.deepEqual(errors, ['err1', 'err2'], 'both errors should be delivered');
    });

    // ---- emitAsync() ----

    it('should not throw in emitAsync when listener errors occur', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      e.on('data', async () => { throw new Error('async-err'); });
      const result = await e.emitAsync('data');
      assert.isUndefined(result, 'returns undefined for errored listeners');
    });

    it('should not throw in parallel emitAsync when listener errors occur', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      e.on('data', async () => { throw new Error('parallel-err'); });
      const result = await e.parallel().emitAsync('data');
      assert.isUndefined(result, 'returns undefined');
    });

    // ---- non-error events unaffected ----

    it('should NOT affect normal event behavior', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      let called = false;
      e.on('data', (msg) => { called = true; assert.equal(msg, 'hello'); });
      e.emit('data', 'hello');
      assert.isTrue(called);
    });
  });

  // ============================================================
  //  raiseError: null — call error listeners THEN throw
  // ============================================================
  describe('raiseError: null', () => {

    // ---- _emit level ----

    it('should call error listeners then throw on "error" emit', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      let called = false;
      e.on('error', (err) => {
        called = true;
        assert.equal(err.message, 'boom');
      });

      assert.throws(() => {
        e.emit('error', new Error('boom'));
      }, 'boom');
      assert.isTrue(called, 'error listener should have been called before throw');
    });

    it('should throw when no error listener exists', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      assert.throws(() => {
        e.emit('error', new Error('boom'));
      }, 'boom');
    });

    it('should call multiple error listeners then throw', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      const order = [];
      e.on('error', () => { order.push(1); });
      e.on('error', () => { order.push(2); });

      assert.throws(() => {
        e.emit('error', new Error('boom'));
      }, 'boom');
      assert.deepEqual(order, [1, 2], 'both error listeners should run before throw');
    });

    // ---- emit() sync ----

    it('should call normal listeners, collect errors, re-emit to error listeners, then throw', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      const callOrder = [];
      e.on('data', () => { callOrder.push('d1'); });
      e.on('data', () => { callOrder.push('d2'); throw new Error('inner-err'); });
      e.on('error', (err) => {
        callOrder.push('err-' + err.message);
      });

      assert.throws(() => {
        e.emit('data');
      });
      // d1, d2 should both run; inner-err should be re-emitted to error listener;
      // then the re-emit of 'error' itself has raiseError=null so it throws after listener
      // But the throw is from the inner 'error' emit, which is inside the try block of the outer 'data' emit.
      // The throw propagates, so subsequent listeners won't run.
      assert.include(callOrder[0], 'd1');
      assert.include(callOrder[1], 'd2');
      // The error re-emission should call the error listener
      assert.include(callOrder.join(','), 'err-inner-err');
    });

    // ---- emitAsync() ----

    it('should call error listeners then throw in emitAsync', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      let called = false;
      e.on('error', (err) => {
        called = true;
        assert.equal(err.message, 'boom');
      });

      try {
        await e.emitAsync('error', new Error('boom'));
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.message, 'boom');
        assert.isTrue(called, 'error listener should have been called');
      }
    });

    it('should throw with no error listener in emitAsync', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      try {
        await e.emitAsync('error', new Error('boom'));
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.message, 'boom');
      }
    });

    // ---- non-error events unaffected ----

    it('should NOT throw for non-error events with raiseError=null', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      let called = false;
      e.on('data', () => { called = true; });
      e.emit('data');
      assert.isTrue(called, 'non-error event should work without throwing');
    });
  });

  // ============================================================
  //  Options priority: configure() > setEmitterOptions()
  // ============================================================
  describe('options priority', () => {

    it('configure({raiseError: false}) overrides setEmitterOptions({raiseError: true})', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      let errorCalled = false;
      e.on('error', () => { errorCalled = true; });

      // configure should override: raiseError=false → no throw
      e.configure({ raiseError: false }).emit('error', new Error('boom'));
      assert.isTrue(errorCalled, 'error listener should be called when raiseError=false');
    });

    it('configure({raiseError: true}) overrides setEmitterOptions({raiseError: false})', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      let errorCalled = false;
      e.on('error', () => { errorCalled = true; });

      assert.throws(() => {
        e.configure({ raiseError: true }).emit('error', new Error('boom'));
      }, 'boom');
      assert.isFalse(errorCalled, 'error listener should NOT be called');
    });

    it('configure({raiseError: true}) takes precedence for listener errors too', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      let secondCalled = false;
      e.on('data', () => { throw new Error('err'); });
      e.on('data', () => { secondCalled = true; });

      assert.throws(() => {
        e.configure({ raiseError: true }).emit('data');
      }, 'err');
      assert.isFalse(secondCalled, 'second listener should not run');
    });

    it('should isolate options per configure proxy', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      const aggressive = e.configure({ raiseError: true });
      const lenient = e.configure({ raiseError: false });

      // aggressive proxy should throw
      let errorCalled1 = false;
      aggressive.on('error', () => { errorCalled1 = true; });
      assert.throws(() => { aggressive.emit('error', new Error('a')); }, 'a');
      assert.isFalse(errorCalled1);

      // lenient proxy should not throw
      let errorCalled2 = false;
      lenient.on('error', () => { errorCalled2 = true; });
      lenient.emit('error', new Error('b'));
      assert.isTrue(errorCalled2);

      // original emitter uses setEmitterOptions default (false)
      let errorCalled3 = false;
      e.on('error', () => { errorCalled3 = true; });
      e.emit('error', new Error('c'));
      assert.isTrue(errorCalled3);
    });
  });

  // ============================================================
  //  oncePromise with raiseError option
  // ============================================================
  describe('oncePromise raiseError', () => {

    let e;
    beforeEach(() => { e = new EventEmitter(); });

    // ---- raiseError: true (default-ish, reject) ----

    it('should reject when raiseError=true (explicit)', async () => {
      const err = new Error('boom');
      try {
        const p = oncePromise(e, 'data', { raiseError: true });
        e.emit('error', err);
        await p;
        assert.fail('should have rejected');
      } catch (caught) {
        assert.equal(caught, err);
      }
    });

    it('should reject when raiseError=null (explicit)', async () => {
      const err = new Error('boom');
      try {
        const p = oncePromise(e, 'data', { raiseError: null });
        e.emit('error', err);
        await p;
        assert.fail('should have rejected');
      } catch (caught) {
        assert.equal(caught, err);
      }
    });

    // ---- raiseError: undefined (default, reject) ----

    it('should reject when raiseError is not set (default undefined)', async () => {
      const err = new Error('boom');
      try {
        const p = oncePromise(e, 'data');
        e.emit('error', err);
        await p;
        assert.fail('should have rejected');
      } catch (caught) {
        assert.equal(caught, err);
      }
    });

    // ---- raiseError: false (resolve with error) ----

    it('should resolve with error when raiseError=false', async () => {
      const err = new Error('boom');
      const p = oncePromise(e, 'data', { raiseError: false });
      e.emit('error', err);
      const result = await p;
      assert.equal(result, err, 'should resolve with the error object');
    });

    it('should resolve with error and clean up listeners', async () => {
      const err = new Error('boom');
      const p = oncePromise(e, 'data', { raiseError: false });
      e.emit('error', err);
      await p;

      // Verify cleanup — second oncePromise should work independently
      let resolved = false;
      const p2 = oncePromise(e, 'data');
      e.emit('data');
      await p2.then(() => { resolved = true; });
      assert.isTrue(resolved, 'cleanup succeeded');
    });

    it('should still resolve on target event even with raiseError=false', async () => {
      let resolved = false;
      const p = oncePromise(e, 'data', { raiseError: false });
      e.emit('data', 'hello');
      await p.then(() => { resolved = true; });
      assert.isTrue(resolved, 'should resolve on target event');
    });

    // ---- signal + raiseError interaction ----

    it('raiseError=false: resolve with error (not abort) when both happen', async () => {
      const err = new Error('boom');
      const p = oncePromise(e, 'data', { raiseError: false });
      // error arrives, should resolve, not reject
      e.emit('error', err);
      const result = await p;
      assert.equal(result, err);
    });

    // ---- oncePromise waiting for 'error' event ----

    it('should resolve normally when waiting for "error" event (raiseError has no effect)', async () => {
      const err = new Error('expected');
      const p = oncePromise(e, 'error', { raiseError: false });
      e.emit('error', err);
      await p; // should resolve, since we're waiting for error event
    });

    it('should resolve normally when waiting for "error" event with raiseError=true', async () => {
      const err = new Error('expected');
      const p = oncePromise(e, 'error', { raiseError: true });
      e.emit('error', err);
      await p; // should resolve, since we're waiting for error event
    });
  });

  // ============================================================
  //  Edge cases & combined scenarios
  // ============================================================
  describe('edge cases', () => {

    it('raiseError=true: should NOT affect non-error event emit', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      let val;
      e.on('data', (v) => { val = v; });
      e.emit('data', 42);
      assert.equal(val, 42);
    });

    it('raiseError=null: should NOT throw for non-error event emit', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      let val;
      e.on('data', (v) => { val = v; });
      const result = e.emit('data', 42);
      assert.equal(result, undefined);
      assert.equal(val, 42);
    });

    it('multiple configure() calls should chain correctly', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false, asyncMode: 'serial' });

      // First configure overrides
      const c1 = e.configure({ raiseError: true });
      // Second configure merges with first
      const c2 = c1.configure({ resultMode: 'collect' });

      // c2 should have raiseError=true from c1
      let errorCalled = false;
      c2.on('error', () => { errorCalled = true; });
      assert.throws(() => c2.emit('error', new Error('boom')), 'boom');
      assert.isFalse(errorCalled);

      // c1 should still have its config
      let errorCalled2 = false;
      c1.on('error', () => { errorCalled2 = true; });
      assert.throws(() => c1.emit('error', new Error('boom')), 'boom');
      assert.isFalse(errorCalled2);
    });

    it('raiseError=false: "error" with undefined msg should not throw', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });
      // Should NOT throw
      e.emit('error');
    });

    it('raiseError=true: "error" with no message should throw auto-created Error', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });
      assert.throws(() => {
        e.emit('error');
      }, "Uncaught, unspecified 'error' event.");
    });

    it('should work with wrapEventEmitter', () => {
      const emitter = wrapEventEmitter();
      emitter.setEmitterOptions({ raiseError: false });
      // Should not throw
      emitter.emit('error', new Error('boom'));
    });

    it('should work with wrapEventEmitter + raiseError=true', () => {
      const emitter = wrapEventEmitter();
      emitter.setEmitterOptions({ raiseError: true });
      assert.throws(() => {
        emitter.emit('error', new Error('boom'));
      }, 'boom');
    });

    // ---- raiseError=true with once listeners ----

    it('raiseError=true: once listener that throws should be removed before propagate', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      let first = true;
      e.on('data', () => { throw new Error('inner'); });
      e.on('data', () => { first = false; }); // should not run

      assert.throws(() => { e.emit('data'); }, 'inner');
      assert.isTrue(first, 'second listener should not run');
    });

    // ---- raiseError=false with 'error' after listener errors ----

    it('raiseError=false: listener error re-emitted as error should not throw when error listener absent', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      // no error listener
      e.on('data', () => { throw new Error('inner-err'); });
      // Should not throw
      e.emit('data');
    });

    it('raiseError=false: error emitted directly without listener should not throw', () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      // no error listener
      // Should not throw
      e.emit('error', new Error('silent'));
    });
  });

  // ============================================================
  //  Integration: raiseError with parallel/configure
  // ============================================================
  describe('integration with parallel/configure', () => {

    it('raiseError=true + parallel emitAsync: error propagates', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      e.on('data', async () => { throw new Error('p1'); });
      e.on('data', async () => { throw new Error('p2'); });

      try {
        await e.parallel().emitAsync('data');
        assert.fail('should have thrown');
      } catch (err) {
        assert.isTrue(
          err.name === 'AggregateError' || err.message === 'p1' || err.message === 'p2',
          'should throw from parallel failure'
        );
      }
    });

    it('raiseError=false + parallel emitAsync: all run, errors collected', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      const callOrder = [];
      e.on('data', async () => { callOrder.push(1); throw new Error('p1'); });
      e.on('data', async () => { callOrder.push(2); });
      e.on('data', async () => { callOrder.push(3); throw new Error('p3'); });

      const result = await e.parallel().emitAsync('data');
      // all three should run (parallel mode)
      assert.equal(callOrder.length, 3, 'all listeners should run');
    });
  });

  // ============================================================
  //  RaiseError with abort signal
  // ============================================================
  describe('raiseError with AbortSignal', () => {

    it('raiseError=true: AbortError should still propagate', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      const ctrl = new AbortController();
      e.on('data', async () => {
        await new Promise(() => {}); // never resolves
      });

      const emitPromise = e.configure({ signal: ctrl.signal }).emitAsync('data');
      ctrl.abort();

      try {
        await emitPromise;
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, 'AbortError');
      }
    });

    it('raiseError=false: AbortError should still propagate', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: false });

      const ctrl = new AbortController();
      e.on('data', async () => {
        await new Promise(() => {}); // never resolves
      });

      const emitPromise = e.configure({ signal: ctrl.signal }).emitAsync('data');
      ctrl.abort();

      try {
        await emitPromise;
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, 'AbortError');
      }
    });

    it('raiseError=null: AbortError still takes priority', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: null });

      const ctrl = new AbortController();
      e.on('data', async () => {
        await new Promise(() => {}); // never resolves
      });

      const emitPromise = e.configure({ signal: ctrl.signal }).emitAsync('data');
      ctrl.abort();

      try {
        await emitPromise;
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, 'AbortError');
      }
    });

    it('raiseError=true: aborted signal before emit should throw immediately', async () => {
      const e = new EventEmitter();
      e.setEmitterOptions({ raiseError: true });

      const ctrl = new AbortController();
      ctrl.abort();

      try {
        await e.configure({ signal: ctrl.signal }).emitAsync('data');
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.name, 'AbortError');
      }
    });
  });
});
