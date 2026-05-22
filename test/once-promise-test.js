import {assert} from "chai";
import {oncePromise, EventEmitter, Event} from '../src'
import wrapEventEmitter from '../src/wrap-event-emitter'

describe('oncePromise', () => {
  var ee;

  beforeEach(() => {
    ee = new EventEmitter();
  });

  // ---- 基础功能 ----

  describe('basic', () => {
    it('should resolve when event is emitted', async () => {
      let resolved = false;
      const p = oncePromise(ee, 'data').then(() => { resolved = true; });
      assert.equal(resolved, false, 'not resolved before emit');
      ee.emit('data');
      await p;
      assert.equal(resolved, true, 'resolved after emit');
    });

    it('should resolve only once (next emit does not affect)', async () => {
      const p = oncePromise(ee, 'data');
      ee.emit('data');
      await p;
      // 第二次 emit 不应该出错
      ee.emit('data');
    });

    it('should work with sync emit', async () => {
      const p = oncePromise(ee, 'sync-event');
      ee.emit('sync-event', 1, 2, 3);
      await p;
    });

    it('should work with emitAsync', async () => {
      const p = oncePromise(ee, 'async-event');
      await ee.emitAsync('async-event', 1, 2, 3);
      await p;
    });

    it('should not resolve if other event is emitted', async () => {
      let resolved = false;
      const p = oncePromise(ee, 'target').then(() => { resolved = true; });
      ee.emit('other');
      ee.emit('another');
      assert.equal(resolved, false, 'not resolved on wrong event');
      ee.emit('target');
      await p;
      assert.equal(resolved, true, 'resolved on correct event');
    });
  });

  // ---- resolve 返回 Event 对象 ----

  describe('resolve event object', () => {
    it('should resolve with the Event object', async () => {
      const p = oncePromise(ee, 'data');
      ee.emit('data', 1, 2, 3);
      const evt = await p;
      assert.instanceOf(evt, Event, 'resolved value is Event instance');
      assert.equal(evt.type, 'data', 'event type matches');
      assert.equal(evt.target, ee, 'event target is the emitter');
    });

    it('should have correct type for regex-matched event', async () => {
      const p = oncePromise(ee, /^user\./);
      ee.emit('user.login', { name: 'Alice' });
      const evt = await p;
      assert.equal(evt.type, 'user.login', 'event type is the actual emitted type');
      assert.equal(evt.target, ee, 'event target is the emitter');
    });
  });

  // ---- 错误处理 ----

  describe('error handling', () => {
    it('should reject when error event is emitted (non-error type)', async () => {
      let rejected = false;
      const p = oncePromise(ee, 'data').catch(() => { rejected = true; });
      ee.emit('error', new Error('boom'));
      await p;
      assert.equal(rejected, true, 'rejected on error event');
    });

    it('should reject with the error value', async () => {
      const err = new Error('boom');
      try {
        const p = oncePromise(ee, 'data');
        ee.emit('error', err);
        await p;
        assert.fail('should have rejected');
      } catch (e) {
        assert.equal(e, err, 'rejected with correct error');
      }
    });

    it('should resolve when waiting for error event', async () => {
      const err = new Error('expected');
      let resolved = false;
      const p = oncePromise(ee, 'error').then(() => { resolved = true; });
      assert.equal(resolved, false);
      ee.emit('error', err);
      await p;
      assert.equal(resolved, true, 'resolved when waiting for error');
    });

    it('should not reject when waiting for error event', async () => {
      const err = new Error('expected');
      // 等待 error 事件不应该 reject，而是 resolve
      const p = oncePromise(ee, 'error');
      ee.emit('error', err);
      // 不应该 throw
      await p;
    });

    it('should cleanup error listener after target event resolves', async () => {
      const p = oncePromise(ee, 'data');
      ee.emit('data');
      await p;
      // 验证 error listener 已被移除：添加另一个 error listener 后 emit error，
      // 确认只有新的 listener 响应，不会有来自 oncePromise 的遗留影响
      let errorCaught = false;
      ee.on('error', () => { errorCaught = true; });
      ee.emit('error', new Error('should be caught only by new listener'));
      assert.equal(errorCaught, true, 'error caught by new listener only');
    });

    it('should cleanup target listener after error reject', async () => {
      let rejected = false;
      const p = oncePromise(ee, 'data').catch(() => { rejected = true; });
      ee.emit('error', new Error('boom'));
      await p;
      assert.equal(rejected, true);

      // target listener should have been cleaned up
      const p2 = oncePromise(ee, 'data');
      ee.emit('data');
      await p2;
    });
  });

  // ---- Regex 事件类型 ----

  describe('regex type', () => {
    it('should resolve when regex-matched event is emitted', async () => {
      let resolved = false;
      const p = oncePromise(ee, /^user\./).then(() => { resolved = true; });
      ee.emit('user.login');
      await p;
      assert.equal(resolved, true, 'resolved on matching event');
    });

    it('should not resolve on non-matching event', async () => {
      let resolved = false;
      const p = oncePromise(ee, /^user\./).then(() => { resolved = true; });
      ee.emit('admin.login');
      assert.equal(resolved, false, 'not resolved on non-matching event');
      ee.emit('user.logout');
      await p;
      assert.equal(resolved, true, 'resolved on matching event');
    });

    it('should reject on error for regex type', async () => {
      let rejected = false;
      const p = oncePromise(ee, /^user\./).catch(() => { rejected = true; });
      ee.emit('error', new Error('boom'));
      await p;
      assert.equal(rejected, true);
    });
  });

  // ---- 清理机制 ----

  describe('cleanup', () => {
    it('should remove listeners after resolve', async () => {
      const p = oncePromise(ee, 'data');
      ee.emit('data');
      await p;

      // 第二次 emit data 不应该触发任何 leftover 监听器
      // 验证: 再注册一个 oncePromise 确认它正常工作
      let resolved = false;
      const p2 = oncePromise(ee, 'data').then(() => { resolved = true; });
      ee.emit('data');
      await p2;
      assert.equal(resolved, true);
    });

    it('should remove listeners after reject', async () => {
      let rejected = false;
      const p = oncePromise(ee, 'data').catch(() => { rejected = true; });
      ee.emit('error', new Error('boom'));
      await p;
      assert.equal(rejected, true);

      // 确保下一次 oncePromise 正常工作
      let resolved = false;
      const p2 = oncePromise(ee, 'data').then(() => { resolved = true; });
      ee.emit('data');
      await p2;
      assert.equal(resolved, true);
    });

    it('should allow multiple independent oncePromise calls', async () => {
      let r1 = false, r2 = false, r3 = false;
      const p1 = oncePromise(ee, 'data').then(() => { r1 = true; });
      const p2 = oncePromise(ee, 'data').then(() => { r2 = true; });
      const p3 = oncePromise(ee, 'data').then(() => { r3 = true; });

      ee.emit('data');

      await Promise.all([p1, p2, p3]);
      assert.equal(r1, true);
      assert.equal(r2, true);
      assert.equal(r3, true);
    });
  });

  // ---- 参数校验 ----

  describe('validation', () => {
    it('should throw TypeError for non-object emitter', () => {
      assert.throws(() => oncePromise(null, 'data'), TypeError);
      assert.throws(() => oncePromise(undefined, 'data'), TypeError);
      assert.throws(() => oncePromise(123, 'data'), TypeError);
      assert.throws(() => oncePromise('string', 'data'), TypeError);
    });
  });

  // ---- wrapEventEmitter 兼容 ----

  describe('with wrapEventEmitter', () => {
    it('should work with wrapEventEmitter instance', async () => {
      const emitter = wrapEventEmitter();
      let resolved = false;
      const p = oncePromise(emitter, 'data').then(() => { resolved = true; });
      emitter.emit('data');
      await p;
      assert.equal(resolved, true);
    });

    it('should work with wrapEventEmitter injected object', async () => {
      const obj = {};
      wrapEventEmitter(obj);
      let resolved = false;
      const p = oncePromise(obj, 'data').then(() => { resolved = true; });
      obj.emit('data');
      await p;
      assert.equal(resolved, true);
    });

    it('should reject on error with wrapEventEmitter', async () => {
      const emitter = wrapEventEmitter();
      let rejected = false;
      const p = oncePromise(emitter, 'data').catch(() => { rejected = true; });
      emitter.emit('error', new Error('boom'));
      await p;
      assert.equal(rejected, true);
    });
  });

  // ---- 边界情况 ----

  describe('edge cases', () => {
    it('should handle rapid consecutive emits', async () => {
      let resolved = false;
      const p = oncePromise(ee, 'rapid').then(() => { resolved = true; });
      ee.emit('rapid');
      ee.emit('rapid');
      ee.emit('rapid');
      await p;
      assert.equal(resolved, true);
    });

    it('should handle emit with no arguments', async () => {
      const p = oncePromise(ee, 'empty');
      ee.emit('empty');
      await p;
    });

    it('should handle emit with many arguments', async () => {
      const p = oncePromise(ee, 'many');
      ee.emit('many', 1, 'a', {x: 1}, [1, 2], null, undefined);
      await p;
    });

    it('should work with emitAsync parallel mode', async () => {
      let count = 0;
      ee.on('parallel-event', () => { count++; });
      ee.on('parallel-event', () => { count++; });

      const p = oncePromise(ee, 'parallel-event');
      await ee.parallel().emitAsync('parallel-event');
      await p;
      assert.equal(count, 2);
    });

    it('should work with emitAsync serial mode', async () => {
      let count = 0;
      ee.on('serial-event', () => { count++; });
      ee.on('serial-event', () => { count++; });

      const p = oncePromise(ee, 'serial-event');
      await ee.emitAsync('serial-event');
      await p;
      assert.equal(count, 2);
    });
  });
});
