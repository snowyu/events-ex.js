[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [once-promise](../README.md) / oncePromise

# Function: oncePromise()

> **oncePromise**(`emitter`, `type`, `options?`): `Promise`\<[`Event`](../../event/classes/Event.md)\>

Defined in: [src/once-promise.js:23](https://github.com/snowyu/events-ex.js/blob/4b0e5c2237202c2cc8b9e9244905d2c668799451/src/once-promise.js#L23)

Returns a Promise that resolves with the Event object when the specified event is emitted on the given emitter.
If an 'error' event is emitted (and the waiting event is not 'error'), the promise rejects by default.
If the provided AbortSignal is aborted, the promise rejects with an AbortError.

Note: The resolved Event object's `result` field may not be the final value if other listeners have not yet run.
For the definitive emit return value, use `emit()` or `emitAsync()` directly.

## Parameters

### emitter

[`EventEmitter`](../../event-emitter/classes/EventEmitter.md)

The event emitter to listen on.

### type

`string` \| `RegExp`

The event type to wait for.

### options?

Optional configuration.

#### raiseError?

`boolean` \| `null`

Controls behavior when an 'error' event is emitted:
  - `true` / `undefined` (default): The promise rejects with the error.
  - `false`: The promise resolves with the error object instead of rejecting.

#### signal?

`any`

An AbortSignal to cancel the wait.

## Returns

`Promise`\<[`Event`](../../event/classes/Event.md)\>

- A promise that resolves with the Event object.

## Throws

- If emitter is not a valid event emitter object.
