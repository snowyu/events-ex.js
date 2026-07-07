[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [all-off](../README.md) / allOff

# Function: allOff()

> **allOff**(`emitter`, `type?`): [`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

Defined in: [src/all-off.js:12](https://github.com/snowyu/events-ex.js/blob/1738d9bce8d1eae4826213336afe3c0c8e5fa482/src/all-off.js#L12)

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
