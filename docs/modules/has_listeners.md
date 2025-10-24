[events-ex](../README.md) / [Exports](../modules.md) / has-listeners

# Module: has-listeners

## Table of contents

### References

- [default](has_listeners.md#default)

### Functions

- [hasListeners](has_listeners.md#haslisteners)

## References

### default

Renames and re-exports [hasListeners](has_listeners.md#haslisteners)

## Functions

### hasListeners

▸ **hasListeners**(`obj`, `type?`): `boolean`

Checks if an object has event listeners.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `any` | The object to check. Must not be null or undefined. |
| `type?` | `string` | Optional parameter specifying the event type. If provided, checks for the existence of listeners for this specific type. |

#### Returns

`boolean`

- If `type` is provided, returns whether listeners for the specified event type exist.
         - If `type` is not provided, returns whether the object has any event listeners.

**`Throws`**

Throws a TypeError if `obj` is null or undefined.

#### Defined in

[src/has-listeners.js:20](https://github.com/snowyu/events-ex.js/blob/9c254b2/src/has-listeners.js#L20)
