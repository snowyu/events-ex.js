### events-ex [![npm](https://img.shields.io/npm/v/events-ex.svg)](https://npmjs.org/package/events-ex) [![downloads](https://img.shields.io/npm/dm/events-ex.svg)](https://npmjs.org/package/events-ex) [![license](https://img.shields.io/npm/l/events-ex.svg)](https://npmjs.org/package/events-ex)

浏览器友好的增强的**事件**[能力][Ability]和类。 它主要是从 [event-emitter][event-emitter] 修改而来的。 本库可以为你的任何类添加(注入)**事件**[能力][Ability]。

### Features

* **模块化 Event-able 能力**：通过 `eventable(MyClass)` 将事件功能注入任何类，无需强制继承。
* **核心事件增强**：
  * **冒泡与中断**：全面支持事件传播控制及中途取消。
  * **监听器排序**：通过 `on()` 和 `once()` 的可选 `index` 参数精确控制执行顺序。支持特殊值 `'first'` 和 `'last'` 以确保监听器始终保持在边界。
  * **正则表达式订阅**：支持使用正则表达式订阅多个匹配的事件。
  * **可挂载(Hook-able)系统**：允许在核心层面拦截并修改事件行为。
* **高级异步特性 (仅针对 `emitAsync`)**：
  * **可配置的并发性**：异步监听器支持 **顺序(Serial)**（默认）和 **并发(Parallel)** 执行。
  * **结果聚合策略**：支持多种收集返回值的方式：`last`（默认）、`first`（首个成功结果）和 `collect`（所有结果）。
  * **Fluent API 代理**：通过 `.parallel()` 和 `.configure()` 提供无副作用的临时执行上下文。
  * **AbortSignal 支持**：通过 `configure({ signal })` 支持取消异步事件发射，也可用于 `oncePromise`。
* **架构优势**：重写核心以提升性能与灵活性，同时保持广泛的兼容性。
* **事件工具集**：内置支持 `pipe`, `pipeAsync`, `oncePromise`, `unify`, `allOff` 和 `hasListeners`。

### 区别

* **与 [Node 事件模块](https://nodejs.org/api/events.html) 的区别**
  * 🔁 **`改变`**: 事件支持冒泡机制与中断
    * 事件对象(`Event Object`)作为监听器的 "this" 对象。
      * `result` 属性: 可选, 如果设置,则将该结果返回到事件发射器(`Event Emitter`)。
      * `stopped` 属性: 可选, 如果设置为 `true`，则会阻止剩余的监听器被执行。
      * `aborted` 属性: (仅异步) `true` 表示事件发射被 `AbortSignal` 取消。
      * `target`属性: 事件发射器对象,原本的`this`
      * `type`属性: 触发的事件类型名称
      * `resolved`: (仅异步) 在 `first` 模式下，标识是否已找到成功的结果。
    * **`改变`**: `emit` 方法返回监听器回调函数的结果而不是成功状态。
    * **`改变`**: 监听器回调函数的 `this` 对象是 `Event Object` 事件对象而不是事件发射器对象。
      * 事件发射器对象被放入 `Event` 对象的 `target` 属性中。
  * ⚡ **增强的 `emitAsync` 方法 (异步专用)**:
    * **顺序模式 (Serial)**: 逐个执行监听器，尊重 `this.stopped` 中断(默认)。
    * **并发模式 (Parallel)**: 同时执行所有监听器。
    * **结果策略**:
      * `last`: 返回最后一个（或最后完成的）监听器的结果。
      * `first`: 返回第一个成功的非 undefined 结果（自动跳过错误）。
      * `collect`: 按注册顺序以数组形式返回所有结果。
  * **流式配置**: 使用 `.parallel()` 或 `.configure({...})` 进行单次定制化异步发射。
  * **事件监听器 API**: `on/once(event: string|RegExp, listener, index?: number|'first'|'last')`
    * 📌 **Index 参数** (可选): 在监听器数组中指定插入位置。
      * `'first'` (`-Infinity`): 始终保持在 **Head** 区。先注册的 `'first'` 监听器排在最前面。
      * `'last'` (`Infinity`): 始终保持在 **Tail** 区。先注册为 `'last'` 的监听器将始终位于数组的绝对末尾。
      * `number`: 常规 **Body** 区内的相对索引。
    * 🧪 **正则事件匹配**: 允许使用正则表达式绑定多个相关事件。

* **与 [event-emitter](https://github.com/medikoo/event-emitter) 的区别**
  * **`改变`**: 事件支持冒泡机制（如上所述）。
  * 添加了默认最大监听器数量的类属性，以保持与 Node 事件模块的兼容性。
  * 添加了 `setMaxListeners` 方法，以保持与 Node 事件模块的兼容性。
  * 添加了 `error`、`newListener` 和 `removeListener` 事件，以保持与 Node 事件模块的兼容性。
  * 添加了 `listeners()` 方法，以保持与 Node 事件模块的兼容性。
  * 添加了 `listenerCount()` 类方法，以保持与 Node 事件模块的兼容性。
  * 添加了`emitAsync`等方法,支持异步事件

* 🔗 **事件管道与统一**：
  * `pipe(source, target)`: 同步事件转发。
  * `pipeAsync(source, target, options)`: 异步转发，支持可配置的并发性与聚合。
  * `unify(emitter1, emitter2)`: 双向事件同步。

> 注意：监听器抛出的错误不会打断通知流程——捕获到的错误会在所有监听器执行完毕后，以 `'error'` 事件形式重新 emit（`emit('error', error, 'notify', eventName, listener, args)`）。**例外**：如果错误是在 `'error'` 事件监听器内部抛出的，它会直接作为异常向外传播（而非再次 emit），以**避免无限递归/栈溢出**。

---

### 用法

#### 核心特性：监听器排序 (Index 参数)

```js
const ee = new EventEmitter();
ee.on('test', () => console.log('third'));
ee.on('test', () => console.log('first'), 'first'); // 始终在最前
ee.on('test', () => console.log('last'), 'last');   // 始终在最后
ee.on('test', () => console.log('second'), 1);      // 常规区域索引 1 (相对于 Head)

ee.emit('test');
// 输出:
// first
// second
// third
// last
```

#### 核心特性：正则表达式订阅

```js
const ee = new EventEmitter();
ee.on(/^user\..*/, function(data) {
  console.log(`事件 ${this.type} 触发，数据：`, data);
});

ee.emit('user.login', { id: 1 });
ee.emit('user.logout', { id: 1 });
```

#### 核心特性：冒泡与中断示例

```js
import {EventEmitter, states} from 'events-ex';
import {isObject} from 'util-ex';

class MyDb extends EventEmitter {
  get(key) {
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
  let result = myGet(key);
  if (result != null) {
    this.result = { state: states.DONE, result: result }
    this.stopped = true // 停止后续监听器执行
  } else {
    this.result = { state: states.ABORT };
  }
})
```

#### 异步专用特性：并发与聚合

这些特性**仅适用于** `emitAsync` 方法。

```js
const ee = new EventEmitter();
ee.on('task', async () => {
  await sleep(100);
  return '结果 1';
});
ee.on('task', async () => {
  return '结果 2';
});

// 1. 默认 (串行)：顺序执行，返回 '结果 2'
const res = await ee.emitAsync('task');

// 2. 并发 + 收集：并发执行，返回 ['结果 1', '结果 2']
const allResults = await ee.parallel('collect').emitAsync('task');

// 3. 并发 + 首个成功：并发执行，返回最快成功的 '结果 2'
const firstResult = await ee.parallel('first').emitAsync('task');
```

#### AbortSignal 支持（仅针对异步）

通过 `configure({ signal })` 或 `oncePromise` 的 `options` 参数支持标准的 `AbortSignal`，可取消异步事件发射。

```js
const emitter = new EventEmitter();
const controller = new AbortController();

emitter.on('task', async () => {
  await sleep(500);
  return '完成';
});

// emitAsync: 通过 configure 传递 signal
setTimeout(() => controller.abort(), 200); // 200ms 后取消
try {
  await emitter.configure({ signal: controller.signal }).emitAsync('task');
} catch (err) {
  console.log(err.name); // 'AbortError'
}

// oncePromise: 通过 options 直接传递 signal
const c2 = new AbortController();
setTimeout(() => c2.abort(), 100);
try {
  await oncePromise(emitter, 'ready', { signal: c2.signal });
} catch (err) {
  console.log(err.name); // 'AbortError'
}
```

**行为说明**：

- **串行模式 (Serial)**：每个 listener 执行前检查 `signal.aborted`，触发则立即中断并抛出 `AbortError`。当显式设置了 `raiseError`（`true`/`false`/`null`）时，还会通过 `Promise.race` 打断**正在执行**的 listener。
- **并发模式 (Parallel)**：用 `Promise.race` 将 listener 执行与 signal 竞速，signal 触发立即抛出 `AbortError`。
- **pipeAsync**：串行模式下，向每个 pipe target 转发前检查 source 的 signal，已 abort 则跳过后续 targets。
- `Event` 对象新增 `aborted` 字段，独立于 `stopped`，用于追踪取消状态。

### 高级特性

#### 异步并发引擎 (仅针对 `emitAsync`)

| 选项 | 取值 | 说明 |
| :--- | :--- | :--- |
| **`asyncMode`** | `'serial'` | **(默认)** 监听器逐个运行。支持 `this.stopped` 中断。 |
| | `'parallel'` | 监听器并发运行。忽略 `this.stopped`。 |
| **`resultMode`** | `'last'` | **(默认)** 返回最后一个监听器的结果（并发模式下为最后一个完成的）。 |
| | `'first'` | 返回第一个 **非 undefined** 且 **成功** 的结果。自动跳过错误。 |
| | `'collect'` | 按注册顺序以数组形式返回所有监听器的结果。 |
| **`signal`** | `AbortSignal` | 通过 `AbortController` 创建的信号，用于取消异步事件发射。仅在 `configure()` 中传递，不会固化到实例上。 |
| **`raiseError`** | `true` | 立即抛出所有监听器错误。并发模式下多个错误会聚合为 `AggregateError`。 |
| | `false` | 静默吞掉监听器错误。与 `signal` 配合时可在串行模式下打断正在执行的监听器（启用 `Promise.race`）。 |
| | `null` | **(同步 `emit` 默认值)** 仅针对 `error` 事件：无 error 监听器时抛出（Node.js 默认行为）。 |
| | `undefined` | **(默认值)** 对 `emitAsync` 等同于 `false`。保持现有行为不变。 |

#### 代理隔离 (Fluent API)

调用 `.parallel()` 或 `.configure()` 返回一个临时的代理对象 (`Object.create(this)`)，确保并发场景下的线程安全和配置隔离。

#### 安全注入 (AoP 兼容性) 与命名冲突

通过 `wrapEventEmitter(target)` 或 `eventable(MyClass)` 向现有对象或原型注入事件能力时，仅注入**最小方法集**以降低命名冲突风险：

- `on`, `once`, `off`
- `emit`, `emitAsync`
- `setEmitterOptions`

⚠️ **命名冲突警告**：如果您的目标对象已经拥有这些同名方法，它们将被覆盖。

**解决方案：方法重命名 (Rename)**
您可以利用 `eventable` 的 `rename` 选项将注入的方法映射为自定义名称：

```js
eventable(MyClass, {
  rename: {
    emitAsync: 'myEmitAsync',
    on: 'addListener'
  }
});
// 现在可以使用：inst.myEmitAsync('event')
```

**完整 EventEmitter 与 最小注入的区别**

- **独立实例**：在不传递 `target` 参数的情况下调用 `ee()` 或 `new EventEmitter()`，将返回包含所有高级方法（包括 `.parallel()`, `.configure()`, `.setMaxListeners()` 等）的**完整实例**。
- **注入模式**：向 `ee(target)` 传递目标对象或使用 `eventable` 时，会执行**最小化注入**以保持目标对象的原有精简结构。如果需要配置并行或聚合模式，请直接在目标对象上使用 `setEmitterOptions`。

---

### API

#### eventable(class[, options]) _(events-ex/eventable)_

为类直接添加事件能力。

* `class`: 要注入能力的类。
* `options`: 可选参数
  * `include/exclude`: 包含/排除特定方法。
  * `emitterOptions`: 发射器的默认配置（如 `asyncMode`, `resultMode`）。
  * `rename` _(object)_: 将注入的方法映射为自定义名称。
    * 键：原始方法名（如 'on', 'emitAsync'）。
    * 值：重命名后的新名称。

#### pipeAsync(source, target[, name, options]) _(events-ex/pipe-async)_

创建异步管道。支持配置传播模式和结果聚合策略。

- `options.asyncMode`: 传播模式 (`'serial' | 'parallel'`)。
- `options.resultMode`: 结果聚合策略（`'last'` 默认 | `'first'` | `'collect'`）。

#### oncePromise(emitter, type[, options]) _(events-ex/once-promise)_

返回一个 `Promise`，当指定事件在 emitter 上触发时，resolve 并传入 **Event 对象**。
如果 emitter 触发了 `error` 事件（且等待的事件不是 `error`），则 Promise reject。
如果提供的 `AbortSignal` 被取消，则 Promise reject 并抛出 `AbortError`。

- `emitter` _(EventEmitter)_: 要监听的事件发射器。
- `type` _(string | RegExp)_: 要等待的事件类型。支持正则表达式匹配多个事件。
- `options` _(Object)_: 可选配置。
  - `signal` _(AbortSignal)_: 用于取消等待的 AbortSignal。
  - `raiseError` _(boolean|null)_: 控制当 emitter 触发 `'error'` 事件时的行为。
    - `true` / `undefined` **（默认）**: Promise reject 并传入错误对象。
    - `false`: Promise resolve 并传入错误对象，而非 reject。
- 返回: `Promise<Event>` — resolve 时传入 Event 对象，包含 `type`、`target` 等属性。

> 注意：返回的 Event 对象中的 `result` 字段可能不是最终值（如果还有其他监听器尚未执行）。如需获取 emit 的最终返回值，请直接使用 `emit()` 或 `emitAsync()`。

```js
import {oncePromise, EventEmitter} from 'events-ex';

const ee = new EventEmitter();

// 等待 data 事件
setTimeout(() => ee.emit('data', { id: 1 }), 100);
const evt = await oncePromise(ee, 'data');
console.log(evt.type);   // 'data'
console.log(evt.target); // 发射器对象

// 等待正则匹配的事件 – evt.type 会告诉你实际触发的事件类型
setTimeout(() => ee.emit('user.login', { name: 'Alice' }), 100);
const evt2 = await oncePromise(ee, /^user\./);
console.log(evt2.type); // 'user.login' (而非正则表达式)

// 错误处理：触发 error 时会 reject（除非等待的就是 'error'）
try {
  await oncePromise(ee, 'data');
} catch (err) {
  console.error('发生错误:', err);
}

// 等待 'error' 事件会正常 resolve
ee.emit('error', new Error('预期的错误'));
await oncePromise(ee, 'error'); // 正常 resolve，不会 reject

// 配合 AbortSignal 实现超时取消
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
try {
  const evt = await oncePromise(ee, 'response', { signal: controller.signal });
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('等待超时或被取消');
  }
}
```

#### setEmitterOptions(options)

配置实例级的默认选项，包括 `asyncMode`、`resultMode`、`maxListeners` 和 `raiseError`。

[event-emitter]: https://github.com/medikoo/event-emitter
[Ability]: https://github.com/snowyu/custom-ability.js
