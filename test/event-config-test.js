import {assert} from 'chai'
import ee from '../src/wrap-event-emitter'
import {eventable} from '../src/eventable'
import {oncePromise} from '../src/once-promise'
import {sleep} from './test-helper'

describe('event config (evt.config)', () => {
  describe('emit (sync)', () => {

    it('should not set config when no options are configured', () => {
      const e = ee()
      e.on('foo', function () {
        assert.isUndefined(this.config)
      })
      e.emit('foo')
    })

    it('should reflect instance-level setEmitterOptions on config', () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })

      e.on('test', function () {
        assert.isObject(this.config)
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })
      e.emit('test')
    })

    it('should reflect runtime configure() options on config', () => {
      const e = ee()
      e.on('test', function () {
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'first')
      })

      e.configure({ asyncMode: 'parallel', resultMode: 'first' }).emit('test')
    })

    it('should give runtime options precedence over instance options', () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'serial', resultMode: 'last' })

      e.on('test', function () {
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })

      e.configure({ asyncMode: 'parallel', resultMode: 'collect' }).emit('test')
    })

    it('should include raiseError in config when set', () => {
      const e = ee()
      // raiseError: false only short-circuits in _emit() when there are
      // NO 'error' listeners. Since we register one, the emit proceeds
      // normally and the listener can inspect this.config.raiseError.
      e.on('error', function () {
        assert.equal(this.config.raiseError, false)
      })

      e.configure({ raiseError: false }).emit('error', new Error('test'))
    })

    it('should be frozen (cannot be mutated)', () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'parallel' })

      e.on('test', function () {
        assert.isTrue(Object.isFrozen(this.config))
        // ES modules are strict mode, so assignment throws TypeError
        assert.throws(() => { this.config.asyncMode = 'serial' }, TypeError)
      })
      e.emit('test')
    })

    it('should have the correct target and type alongside config', () => {
      const e = ee()
      e.setEmitterOptions({ resultMode: 'collect', asyncMode: 'parallel' })

      e.on('evt', function () {
        assert.equal(this.target, e)
        assert.equal(this.type, 'evt')
        assert.equal(this.config.resultMode, 'collect')
        assert.equal(this.config.asyncMode, 'parallel')
      })
      e.emit('evt')
    })

    it('should create a separate frozen config per emit call', () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'parallel' })

      const cfgs = []
      e.on('evt', function () {
        cfgs.push(this.config)
      })
      e.emit('evt')
      e.emit('evt')

      assert.lengthOf(cfgs, 2)
      assert.notEqual(cfgs[0], cfgs[1],
        'Each emit should have its own frozen config reference')
    })
  })

  describe('emitAsync', () => {

    it('should not set config when no options are configured', async () => {
      const e = ee()
      e.on('foo', function () {
        assert.isUndefined(this.config)
      })
      await e.emitAsync('foo')
    })

    it('should reflect instance-level setEmitterOptions on config', async () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })

      e.on('test', function () {
        assert.isObject(this.config)
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })
      await e.emitAsync('test')
    })

    it('should reflect runtime configure() options on config', async () => {
      const e = ee()
      e.on('test', function () {
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'first')
      })

      await e.configure({ asyncMode: 'parallel', resultMode: 'first' }).emitAsync('test')
    })

    it('should include signal in config when AbortSignal is provided', async () => {
      const e = ee()
      const ac = new AbortController()

      e.on('test', function () {
        assert.isObject(this.config)
        assert.equal(this.config.signal, ac.signal)
      })

      await e.configure({ signal: ac.signal }).emitAsync('test')
    })

    it('should be frozen (cannot be mutated)', async () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'parallel' })

      e.on('test', function () {
        assert.isTrue(Object.isFrozen(this.config))
        assert.throws(() => { this.config.asyncMode = 'serial' }, TypeError)
      })
      await e.emitAsync('test')
    })

    it('should give runtime options precedence over instance options', async () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'serial', resultMode: 'last' })

      e.on('test', function () {
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })

      await e.configure({ asyncMode: 'parallel', resultMode: 'collect' }).emitAsync('test')
    })

    it('should have correct target and type alongside config', async () => {
      const e = ee()
      e.setEmitterOptions({ resultMode: 'collect' })

      e.on('evt', function () {
        assert.equal(this.target, e)
        assert.equal(this.type, 'evt')
        assert.equal(this.config.resultMode, 'collect')
      })
      await e.emitAsync('evt')
    })

    it('should create a separate frozen config per emitAsync call', async () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'parallel' })

      const cfgs = []
      e.on('evt', function () {
        cfgs.push(this.config)
      })
      await e.emitAsync('evt')
      await e.emitAsync('evt')

      assert.lengthOf(cfgs, 2)
      assert.notEqual(cfgs[0], cfgs[1],
        'Each emitAsync should have its own frozen config reference')
    })
  })

  describe('oncePromise', () => {

    it('should resolve with config on the Event when options are set', async () => {
      const e = ee()
      e.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })

      // Trigger an emit so oncePromise resolves
      setTimeout(() => e.emit('data', 42), 10)
      const evt = await oncePromise(e, 'data')

      assert.isObject(evt.config)
      assert.equal(evt.config.asyncMode, 'parallel')
      assert.equal(evt.config.resultMode, 'collect')
    })

    it('should not have config when no options are set', async () => {
      const e = ee()

      setTimeout(() => e.emit('data', 42), 10)
      const evt = await oncePromise(e, 'data')

      assert.isUndefined(evt.config)
    })
  })

  describe('eventable class', () => {

    it('should set config on Event for class instances', () => {
      class MyEmitter {}
      eventable(MyEmitter)

      const inst = new MyEmitter()
      inst.setEmitterOptions({ asyncMode: 'parallel' })

      inst.on('foo', function () {
        assert.equal(this.config.asyncMode, 'parallel')
      })
      inst.emit('foo')
    })

    it('should set config on Event for class instances async', async () => {
      class MyEmitter {}
      eventable(MyEmitter)

      const inst = new MyEmitter()
      inst.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })

      inst.on('foo', function () {
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })
      await inst.emitAsync('foo')
    })
  })
})
