### events-ex [![npm](https://img.shields.io/npm/v/events-ex.svg)](https://npmjs.org/package/events-ex) [![downloads](https://img.shields.io/npm/dm/events-ex.svg)](https://npmjs.org/package/events-ex) [![license](https://img.shields.io/npm/l/events-ex.svg)](https://npmjs.org/package/events-ex)


浏览器友好的增强的**事件**[能力][Ability]和类。 它主要是从 [event-emitter][event-emitter] 修改而来的。 本库可以为你的任何类添加(注入)**事件**[能力][Ability]。


TODO: 异步事件,添加`emitAsync`方法. 没这么简单,因为要支持bubbling,所以必须顺序执行事件.
将`bubbling`作为功能选项.如果没有启用,就可以乱发了.

当关闭`bubbling`的时候,那么是否还需要用`event`对象传递.

首先完成异步支持.已经完成.`emitAsync`方法已经加上.

### Features

* 重写核心架构
* 尽最大可能性与[node events][Node Events] and [event-emitter][event-emitter]保持兼容
* 更强大的 event-able [能力][Ability]
* 可挂载的事件系统, 用于更好地控制事件处理
* 支持异步事件通过 `emitAsync` 方法,该方法会等待所有异步`listeners`处理完毕后返回结果
* 支持正则表达式匹配订阅事件

### 区别

* 与 [Node 事件模块](https://nodejs.org/api/events.html) 的区别
  * **`改变`**: 事件支持冒泡机制与中断
    * 事件对象(`Event Object`)作为监听器的 "this" 对象。
      * `result` 属性: 可选, 如果设置,则将该结果返回到事件发射器(`Event Emitter`)。
      * `stopped` 属性: 可选, 如果设置为 `true`，则会阻止剩余的监听器被执行。
      * `target`属性: 事件发射器对象,原本的`this`
      * `type`属性: 触发的事件类型名称
    * **`改变`**: `emit` 方法返回监听器回调函数的结果而不是成功状态。
    * **`改变`**: 监听器回调函数的 `this` 对象是 `Event Object` 事件对象而不是事件发射器对象。
      * 事件发射器对象被放入 `Event` 对象的 `target` 属性中。
  * 添加了`emitAsync`方法,支持异步事件
* 与 [event-emitter](https://github.com/medikoo/event-emitter) 的区别
  * **`改变`**: 事件支持冒泡机制（如上所述）
  * 添加了默认最大监听器数量的类属性，以保持与 Node 事件模块的兼容性。
  * 添加了 `setMaxListeners` 方法，以保持与 Node 事件模块的兼容性。
  * 添加了 `error`、`newListener` 和 `removeListener` 事件，以保持与 Node 事件模块的兼容性。
  * 添加了 `listeners()` 方法，以保持与 Node 事件模块的兼容性。
  * 添加了 `listenerCount()` 类方法，以保持与 Node 事件模块的兼容性。
  * 添加了`emitAsync`方法,支持异步事件

注意: 时间内部引发错误不会中断通知，但是会在通知结束时 emit 错误事件(`emit('error', error, 'notify', eventName, listener, args)`)

### 安装

```
npm install events-ex@alpha
```


### 用法

直接继承使用 `EventEmitter` 类

```js
import {EventEmitter} from 'events-ex';

class MyClass extends EventEmitter {}
```

直接添加/注入事件(event-able)[能力][Ability] 到你的类:

```js
import {eventable} from 'events-ex';

class MyClass extends MyRoot {}

// inject the eventable ability to MyClass
eventable(MyClass);
```

现在,可以在你的类中使用事件了:

```js
const my = new MyClass;

my.on('event', function() {
  console.log('event occur');
});

my.on(/^event/, function() {
  console.log('regexp match multi events');
});

my.emit('event');
my.emit('event1');
```

事件冒泡机制的使用:

```js
import {EventEmitter, states} from 'events-ex';
import {isObject} from 'util-ex';

states.ABORT = -1
class MyDb extends EventEmitter {
  get(key) {
    // Demo the event object bubbling usage:
    let result = this.emit('getting', key)
    if(isObject(result)) {
      if (result.state === states.ABORT) return
      if (result.state === states.DONE)  return result.result
    }
    return _get(key)
  }
}

let db = new MyDb
db.on('getting', function(key){
  result = myGet(key);
  if (result != null) {
    // get the key succ
    this.result = {
      state: states.DONE,
      result: result,
    }
    this.stopped = true // it will skip other listeners if true
  } else {
    // you can abort to get key by default.
    this.result = {state: states.ABORT};
    // this.stopped = true // it will skip other listeners if true
  }
})
```

event-emitter usage:

```javascript

import {wrapEventEmitter as ee} from 'events-ex';

class MyClass { /* .. */ };
ee(MyClass.prototype); // All instances of MyClass will expose event-emitter interface

const emitter = new MyClass();
let listener;

emitter.on('test', listener = function (args) {
  // … react to 'test' event
});

emitter.once('test', function (args) {
  // … react to first 'test' event (invoked only once!)
});

emitter.emit('test', arg1, arg2/*…args*/); // Two above listeners invoked
emitter.emit('test', arg1, arg2/*…args*/); // Only first listener invoked

emitter.off('test', listener);              // Removed first listener
emitter.emit('test', arg1, arg2/*…args*/); // No listeners invoked
```

### API

#### eventable(class[, options]) _(events-ex/eventable)_

Add the event-able ability to the class directly.

* `class`: the class to be injected the ability.
* `options` _(object)_: optional options
  * `include` _(string[]|string)_: only these emitter methods will be added to the class
    * **NOTE:** static method should use the prefix '@' with name.
  * `exclude` _(string[]|string)_: theses emitter methods would not be added to the class
    * **NOTE:** static method should use the prefix '@' with name.
  * `methods` _(object)_: hooked methods to the class
    * key: the method name to hook.
    * value: the new method function
      * use `this.super()` to call the original method.
      * `this.self` is the original `this` object.
  * `classMethods` _(object)_: hooked class methods to the class

```coffee
  eventable  = require('events-ex/eventable')
  #OtherClass = require('OtherClass')
  class OtherClass
    exec: -> console.log "my original exec"

  class MyClass
    # only 'on', 'off', 'emit' and static methods 'listenerCount' added to the class
    eventable MyClass, include: ['on', 'off', 'emit', '@listenerCount']

  # add the eventable ability to OtherClass and inject the exec method of OtherClass.
  eventable OtherClass, methods:
    exec: ->
      console.log "new exec"
      @super() # call the original method
```

#### allOff(obj) _(events-ex/all-off)_

**keep compatible only**: the `removeAllListeners` has already been buildin.

Removes all listeners from given event emitter object

#### hasListeners(obj[, name]) _(events-ex/has-listeners)_

Whether object has some listeners attached to the object.
When `name` is provided, it checks listeners for specific event name

```javascript
var emitter = ee();
var hasListeners = require('events-ex/has-listeners');
var listener = function () {};

hasListeners(emitter); // false

emitter.on('foo', listener);
hasListeners(emitter); // true
hasListeners(emitter, 'foo'); // true
hasListeners(emitter, 'bar'); // false

emitter.off('foo', listener);
hasListeners(emitter, 'foo'); // false
```

#### pipe(source, target[, emitMethodName]) _(events-ex/pipe)_

Pipes all events from _source_ emitter onto _target_ emitter (all events from _source_ emitter will be emitted also on _target_ emitter, but not other way).
Returns _pipe_ object which exposes `pipe.close` function. Invoke it to close configured _pipe_.
It works internally by redefinition of `emit` method, if in your interface this method is referenced differently, provide its name (or symbol) with third argument.

#### unify(emitter1, emitter2) _(events-ex/unify)_

Unifies event handling for two objects. Events emitted on _emitter1_ would be also emitter on _emitter2_, and other way back.
Non reversible.

```javascript
var eeUnify = require('events-ex/unify');

var emitter1 = ee(), listener1, listener3;
var emitter2 = ee(), listener2, listener4;

emitter1.on('test', listener1 = function () { });
emitter2.on('test', listener2 = function () { });

emitter1.emit('test'); // Invoked listener1
emitter2.emit('test'); // Invoked listener2

var unify = eeUnify(emitter1, emitter2);

emitter1.emit('test'); // Invoked listener1 and listener2
emitter2.emit('test'); // Invoked listener1 and listener2

emitter1.on('test', listener3 = function () { });
emitter2.on('test', listener4 = function () { });

emitter1.emit('test'); // Invoked listener1, listener2, listener3 and listener4
emitter2.emit('test'); // Invoked listener1, listener2, listener3 and listener4
```


[event-emitter]: https://github.com/medikoo/event-emitter
[Node Events]: https://nodejs.org/api/events.html
[Ability]: https://github.com/snowyu/custom-ability.js

