[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [all-off](../README.md) / allOff

# Function: allOff()

> **allOff**(`emitter`, `type?`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Defined in: [src/all-off.js:12](https://github.com/snowyu/events-ex.js/blob/4b0e5c2237202c2cc8b9e9244905d2c668799451/src/all-off.js#L12)

Removes all listeners for a specific event or all events from an event emitter.

## Parameters

### emitter

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The event emitter to remove listeners from.

### type?

`string`

The event to remove listeners for. If not provided, all listeners for all events will be removed.

## Returns

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

- The event emitter with all listeners removed.
