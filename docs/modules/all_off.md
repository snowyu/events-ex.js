[events-ex](../README.md) / [Exports](../modules.md) / all-off

# Module: all-off

## Table of contents

### References

- [default](all_off.md#default)

### Functions

- [allOff](all_off.md#alloff)

## References

### default

Renames and re-exports [allOff](all_off.md#alloff)

## Functions

### allOff

▸ **allOff**(`emitter`, `type?`): [`EventEmitter`](../classes/event_emitter.EventEmitter.md)

Removes all listeners for a specific event or all events from an event emitter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `emitter` | [`EventEmitter`](../classes/event_emitter.EventEmitter.md) | The event emitter to remove listeners from. |
| `type?` | `string` | The event to remove listeners for. If not provided, all listeners for all events will be removed. |

#### Returns

[`EventEmitter`](../classes/event_emitter.EventEmitter.md)

- The event emitter with all listeners removed.

#### Defined in

[src/all-off.js:12](https://github.com/snowyu/events-ex.js/blob/9c254b2/src/all-off.js#L12)
