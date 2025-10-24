[events-ex](../README.md) / [Exports](../modules.md) / default-methods

# Module: default-methods

## Table of contents

### References

- [default](default_methods.md#default)

### Functions

- [getEventableMethods](default_methods.md#geteventablemethods)

## References

### default

Renames and re-exports [getEventableMethods](default_methods.md#geteventablemethods)

## Functions

### getEventableMethods

▸ **getEventableMethods**(`aClass`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aClass` | `any` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `emit` | (...`args`: `any`) => `any` |
| `emitAsync` | (...`args`: `any`) => `Promise`\<`any`\> |
| `listenerCount` | (`emitter`: `any`, `type`: `any`) => `number` |
| `listeners` | (`type`: `any`) => `any` |
| `off` | (`type`: `string` \| `RegExp`, `listener`: `Function`) => [`EventEmitter`](../classes/event_emitter.EventEmitter.md) |
| `on` | (`type`: `string` \| `RegExp`, `listener`: `Function`, `index?`: `number`) => [`EventEmitter`](../classes/event_emitter.EventEmitter.md) |
| `once` | (`type`: `string` \| `RegExp`, `listener`: `Function`, `index?`: `number`) => [`EventEmitter`](../classes/event_emitter.EventEmitter.md) |
| `removeAllListeners` | (`type`: `string` \| `RegExp`) => [`EventEmitter`](../classes/event_emitter.EventEmitter.md) |
| `setMaxListeners` | (`n`: `any`) => \{ on(type: string \| RegExp, listener: Function, index?: number): EventEmitter; once(type: string \| RegExp, listener: Function, index?: number): EventEmitter; ... 6 more ...; removeAllListeners(type: string \| RegExp): EventEmitter; } |

#### Defined in

[src/default-methods.js:14](https://github.com/snowyu/events-ex.js/blob/9c254b2/src/default-methods.js#L14)
