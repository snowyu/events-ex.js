import {assert} from "chai"

import unify from '../src/unify'
import {EventEmitter} from '../src'
import ee from '../src/wrap-event-emitter'

/**
 * NOTE: Both EventEmitter constructor and ee()/wrapEventEmitter create _events: {} immediately.
 * To test paths where _events doesn't exist yet, we must delete _events after creation.
 */
describe('unify edge cases', () => {
  it('should unify when both have no _events (neither had listeners)', () => {
    const x = new EventEmitter()
    const y = new EventEmitter()
    // Both have _events: {} from constructor. Delete them to test "no _events" path.
    delete x._events
    delete y._events
    unify(x, y)
    // Both should now share a newly created _events
    assert.equal(x._events, y._events, 'both should share the same _events')
    // Adding a listener to x should also affect y
    let count = 0
    x.on('foo', () => { count++ })
    y.emit('foo')
    assert.equal(count, 1, 'y emit should trigger x listener after unify')
  })

  it('should unify when only e2 has _events', () => {
    const x = new EventEmitter()
    const y = new EventEmitter()
    delete x._events
    // y has _events from constructor
    let count = 0
    y.on('foo', () => { count++ })  // y has _events
    unify(x, y)
    // x should now share y's _events
    assert.equal(x._events, y._events, 'both should share the same _events')
    // Emitting from x should trigger y's listener
    x.emit('foo')
    assert.equal(count, 1, 'x emit triggers y listener after unify')
  })

  it('should unify when only e1 has _events', () => {
    const x = new EventEmitter()
    const y = new EventEmitter()
    // x has _events from constructor
    delete y._events
    let count = 0
    x.on('foo', () => { count++ })  // x has _events
    unify(x, y)
    // y should now share x's _events
    assert.equal(x._events, y._events, 'both should share the same _events')
    // Emitting from y should trigger x's listener
    y.emit('foo')
    assert.equal(count, 1, 'y emit triggers x listener after unify')
  })

  it('should unify when both already have the same _events (idempotent)', () => {
    const x = new EventEmitter()
    const y = new EventEmitter()
    let count = 0
    x.on('foo', () => { count++ })
    unify(x, y)
    assert.equal(x._events, y._events, 'first unify should share events')

    // Second unify on the same pair — should early-return (data === e2._events)
    unify(x, y)
    assert.equal(x._events, y._events, 'second unify should not break sharing')

    count = 0
    y.emit('foo')
    assert.equal(count, 1, 'y emit triggers listener after second unify')
  })

  it('should work with mix of EventEmitter and ee()', () => {
    const x = new EventEmitter()
    const y = ee()
    let count = 0
    x.on('foo', () => { count++ })
    unify(x, y)
    y.emit('foo')
    assert.equal(count, 1, 'y should trigger x listener')
  })
})
