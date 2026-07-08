[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [all-off](../README.md) / allOff

# Function: allOff()

> **allOff**(`emitter`, `type?`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Defined in: [src/all-off.js:12](https://github.com/snowyu/events-ex.js/blob/bbf438be440e5a9f2be264532e8ba99ae44b6989/src/all-off.js#L12)

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
