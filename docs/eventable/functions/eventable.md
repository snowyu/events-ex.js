[**events-ex**](../../README.md)

***

[events-ex](../../modules.md) / [eventable](../README.md) / eventable

# Function: eventable()

> **eventable**\<`T`\>(`targetClass?`, `options?`): `EnhancedClass`\<`T`, (`aClass?`) => `Function`\>

Defined in: [src/eventable.js:89](https://github.com/snowyu/events-ex.js/blob/53cfb5bb3f7229cb549e99d410c0d6d39665eb0a/src/eventable.js#L89)

Adds event-emitting capabilities to a class by injecting necessary methods and properties.

This function uses `createAbilityInjector` from `custom-ability` to inject event-related methods
into the target class. The injected methods include standard EventEmitter functionality such as
`on`, `off`, `emit`, `emitAsync`, `once`, `listeners`, `@listenerCount` and more. It also ensures compatibility with Node.js `EventEmitter`
by including methods like `listenerCount`, `setMaxListeners`, `addListener`, `removeListener`, and `removeAllListeners`.

 eventable

## Type Parameters

### T

`T` *extends* `ClassEx`

## Parameters

### targetClass?

`T`

### options?

`AbilityOptions`

Optional configuration for the injection process:
  * `include` (string[]|string): Specifies which methods should be added.
    Static methods should use the prefix '@'.
  * `exclude` (string[]|string): Specifies which methods should not be added.
    Static methods should use the prefix '@'.
  * `methods` (Object): Custom methods to override or extend the default behavior.
    Use `this.super()` to call the original method and `this.self` to access the original context.
  * `classMethods` (Object): Custom static methods to be added to the class.

## Returns

`EnhancedClass`\<`T`, (`aClass?`) => `Function`\>

The same `aClass` class with event capabilities injected. The return value is the modified `aClass` itself.

## Examples

```ts
import { eventable } from 'events-ex';

class MyClass {}

// Inject only specific methods: 'on', 'off', 'emit', 'emitAsync', and the static 'listenerCount'
eventable(MyClass, { include: ['on', 'off', 'emit', 'emitAsync', '@listenerCount'] });
```

```ts
import { eventable } from 'events-ex';

class OtherClass {
  exec() {
    console.log("Original exec");
  }
}

// Inject event capabilities and override the `exec` method
eventable(OtherClass, {
  methods: {
    exec() {
      console.log("New exec");
      this.super(); // Calls the original `exec` method
    }
  }
});
```
