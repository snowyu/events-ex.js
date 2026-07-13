import {assert} from 'chai'
import pipe from '../src/pipe'
import pipeAsync from '../src/pipe-async'
import ee from '../src/wrap-event-emitter'

describe('pipe config propagation', () => {
  describe('pipe (sync)', () => {
    it('should pass config to source emitter listeners', () => {
      const src = ee()
      src.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })
      const target = ee()

      pipe(src, target)

      src.on('evt', function () {
        assert.isObject(this.config)
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })
      src.emit('evt')
    })

    it('should pass config to pipe target listeners with target own options', () => {
      const src = ee()
      const target = ee()
      target.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })

      pipe(src, target)

      target.on('evt', function () {
        assert.isObject(this.config)
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })
      src.emit('evt')
    })

    it('should give source and target each their own config', () => {
      const src = ee()
      src.setEmitterOptions({ asyncMode: 'serial' })
      const target = ee()
      target.setEmitterOptions({ asyncMode: 'parallel' })

      pipe(src, target)

      const configs = []
      src.on('evt', function () { configs.push({ source: this.config }) })
      target.on('evt', function () { configs.push({ target: this.config }) })

      src.emit('evt')

      assert.lengthOf(configs, 2)
      assert.equal(configs[0].source.asyncMode, 'serial')
      assert.equal(configs[1].target.asyncMode, 'parallel')
    })

    it('should not set config when no options on either emitter', () => {
      const src = ee()
      const target = ee()

      pipe(src, target)
      src.on('evt', function () { assert.isUndefined(this.config) })
      target.on('evt', function () { assert.isUndefined(this.config) })
      src.emit('evt')
    })
  })

  describe('pipeAsync', () => {
    it('should pass config to source emitter listeners', async () => {
      const src = ee()
      src.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })
      const target = ee()

      pipeAsync(src, target)

      src.on('evt', function () {
        assert.isObject(this.config)
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })
      await src.emitAsync('evt')
    })

    it('should pass config to pipe target listeners with target own options', async () => {
      const src = ee()
      const target = ee()
      target.setEmitterOptions({ asyncMode: 'parallel', resultMode: 'collect' })

      pipeAsync(src, target)

      target.on('evt', function () {
        assert.isObject(this.config)
        assert.equal(this.config.asyncMode, 'parallel')
        assert.equal(this.config.resultMode, 'collect')
      })
      await src.emitAsync('evt')
    })

    it('should give source and target each their own config', async () => {
      const src = ee()
      src.setEmitterOptions({ asyncMode: 'serial' })
      const target = ee()
      target.setEmitterOptions({ asyncMode: 'parallel' })

      pipeAsync(src, target)

      const configs = []
      src.on('evt', function () { configs.push({ source: this.config }) })
      target.on('evt', function () { configs.push({ target: this.config }) })

      await src.emitAsync('evt')

      assert.lengthOf(configs, 2)
      assert.equal(configs[0].source.asyncMode, 'serial')
      assert.equal(configs[1].target.asyncMode, 'parallel')
    })

    it('should not set config on source when no options set on source', async () => {
      const src = ee()
      const target = ee()
      target.setEmitterOptions({ asyncMode: 'parallel' })

      pipeAsync(src, target)

      src.on('evt', function () {
        assert.isUndefined(this.config)
      })
      await src.emitAsync('evt')
    })

    it('should not set config when no options on either emitter', async () => {
      const src = ee()
      const target = ee()

      pipeAsync(src, target)
      src.on('evt', function () { assert.isUndefined(this.config) })
      target.on('evt', function () { assert.isUndefined(this.config) })
      await src.emitAsync('evt')
    })
  })
})
