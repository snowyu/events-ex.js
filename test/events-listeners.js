'use strict';
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function listener() {}
function listener2() {}


module.exports = function listenersTest(events, t) {
  var tests = {};
  //t=events; a=assert
  tests['listeners with only one item'] = function () {
    var e1 = new events.EventEmitter();

    e1.on('foo', listener);
    var fooListeners = e1.listeners('foo');
    t.deepEqual(e1.listeners('foo'), [listener]);
    t.equal(e1.listenerCount('foo'), 1);

    e1.removeAllListeners('foo');
    t.equal(e1.listenerCount('foo'), 0)
    t.deepEqual(e1.listeners('foo'), []);
    t.deepEqual(fooListeners, [listener]);

  };

  tests['listeners is a copy'] = function (events, t) {
    var e2 = new events.EventEmitter();

    e2.on('foo', listener);
    var e2ListenersCopy = e2.listeners('foo');
    t.deepEqual(e2ListenersCopy, [listener]);
    t.deepEqual(e2.listeners('foo'), [listener]);

    e2ListenersCopy.push(listener2);
    t.deepEqual(e2.listeners('foo'), [listener]);
    t.deepEqual(e2ListenersCopy, [listener, listener2]);

  };

  tests['listeners with two items'] = function (events, t) {
    var e3 = new events.EventEmitter();

    e3.on('foo', listener);
    var e3ListenersCopy = e3.listeners('foo');
    e3.on('foo', listener2);
    t.deepEqual(e3.listeners('foo'), [listener, listener2]);
    t.deepEqual(e3ListenersCopy, [listener]);
  };
  return tests;
}

