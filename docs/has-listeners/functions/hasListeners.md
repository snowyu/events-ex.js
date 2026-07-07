[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [has-listeners](../README.md) / hasListeners

# Function: hasListeners()

> **hasListeners**(`obj`, `type?`): `boolean`

Defined in: [src/has-listeners.js:20](https://github.com/snowyu/events-ex.js/blob/1738d9bce8d1eae4826213336afe3c0c8e5fa482/src/has-listeners.js#L20)

Checks if an object has event listeners.

## Parameters

### obj

`Object`

The object to check. Must not be null or undefined.

### type?

`string`

Optional parameter specifying the event type. If provided, checks for the existence of listeners for this specific type.

## Returns

`boolean`

- If `type` is provided, returns whether listeners for the specified event type exist.
         - If `type` is not provided, returns whether the object has any event listeners.

## Throws

Throws a TypeError if `obj` is null or undefined.
