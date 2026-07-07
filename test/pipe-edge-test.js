import {assert} from "chai"

import pipe from '../src/pipe'
import {createConfigurableEmitter} from './test-helper'

describe('pipe edge cases', () => {
  it('should pipe with own property descriptor (methods on the object)', () => {
    // When methods are own configurable properties, getOwnPropertyDescriptor returns a descriptor
    // → enters else block: delete desc.get; delete desc.set (lines 40-41)
    const x = createConfigurableEmitter()
    const y = createConfigurableEmitter()
    let count = 0, count2 = 0
    x.on('foo', () => { count++ })
    y.on('foo', () => { count2++ })

    pipe(x, y)
    x.emit('foo')
    assert.equal(count, 1, 'x listener should be called')
    assert.equal(count2, 1, 'y pipe target should be called')
  })

  it('should pipe to three targets', () => {
    const x = createConfigurableEmitter()
    const y = createConfigurableEmitter()
    const z = createConfigurableEmitter()
    const w = createConfigurableEmitter()
    let cy = 0, cz = 0, cw = 0

    x.on('foo', () => {}) // x has its own listener
    y.on('foo', () => { cy++ })
    z.on('foo', () => { cz++ })
    w.on('foo', () => { cw++ })

    pipe(x, y)
    pipe(x, z)
    pipe(x, w)

    x.emit('foo')
    assert.equal(cy, 1, 'y should receive')
    assert.equal(cz, 1, 'z should receive')
    assert.equal(cw, 1, 'w should receive')
  })

  it('should pipe close with multiple targets', () => {
    const x = createConfigurableEmitter()
    const y = createConfigurableEmitter()
    const z = createConfigurableEmitter()
    let cy = 0, cz = 0

    y.on('foo', () => { cy++ })
    z.on('foo', () => { cz++ })

    const pipe1 = pipe(x, y)
    pipe(x, z)

    x.emit('foo')
    assert.equal(cy, 1)
    assert.equal(cz, 1)

    pipe1.close()
    x.emit('foo')
    assert.equal(cy, 1, 'y should not receive after close')
    assert.equal(cz, 2, 'z should still receive')
  })

  it('should pipe with custom method name', () => {
    const x = createConfigurableEmitter()
    const y = createConfigurableEmitter()
    let count = 0

    y.on('foo', () => { count++ })

    // Use a custom emit name
    pipe(x, y, 'customEmit')

    // x.customEmit doesn't exist normally, but pipe creates it
    assert.isFunction(x.customEmit, 'customEmit should be created by pipe')
    // Calling customEmit should forward to y
    x.customEmit('foo')
    assert.equal(count, 1, 'custom emit should forward to pipe target')
  })
})
