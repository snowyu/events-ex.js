// Generated by CoffeeScript 1.9.0
(function() {
  'use strict';
  var create, customAbility, defineProperty, getEventableClass, hasOwnProperty, isArray, isFunction, isNumber, isObject, isUndefined;

  customAbility = require('custom-ability');

  isFunction = require('util-ex/lib/is/type/function');

  isObject = require('util-ex/lib/is/type/object');

  isNumber = require('util-ex/lib/is/type/number');

  isUndefined = require('util-ex/lib/is/type/undefined');

  isArray = require('util-ex/lib/is/type/array');

  defineProperty = require('util-ex/lib/defineProperty');

  hasOwnProperty = Object.prototype.hasOwnProperty;

  create = Object.create;

  getEventableClass = function(aClass) {
    var Eventable;
    return Eventable = (function() {
      var Event, methods;

      function Eventable() {}

      if (aClass == null) {
        aClass = Eventable;
      }

      defineProperty(Eventable, 'methods', methods = {
        on: function(type, listener) {
          var data, m;
          if (!isFunction(listener)) {
            throw TypeError(listener + ' is not a function');
          }
          if (!this.hasOwnProperty('_events')) {
            data = create(null);
            defineProperty(this, '_events', data);
          } else {
            data = this._events;
          }
          if (data.newListener) {
            this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
          }
          if (!data[type]) {
            data[type] = listener;
          } else if (isObject(data[type])) {
            data[type].push(listener);
          } else {
            data[type] = [data[type], listener];
          }
          if (isObject(data[type]) && !data[type].warned) {
            if (!isUndefined(this._maxListeners)) {
              m = this._maxListeners;
            } else {
              m = aClass.defaultMaxListeners;
            }
            if (m && m > 0 && data[type].length > m) {
              data[type].warned = true;
              console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d %s listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', data[type].length, type);
              console.trace();
            }
          }
          return this;
        },
        once: function(type, listener) {
          var fired, once, self;
          if (!isFunction(listener)) {
            throw TypeError(listener + ' is not a function');
          }
          fired = false;
          self = this;
          once = function() {
            self.off(type, once);
            if (!fired) {
              fired = true;
              return listener.apply(this, arguments);
            }
          };
          once.listener = listener;
          this.on(type, once);
          return this;
        },
        Event: Event = (function() {
          var eventCache;

          eventCache = [];

          function Event(target) {
            var evt;
            if (!(this instanceof Event)) {
              evt = eventCache.pop();
              if (!evt) {
                evt = new Event(target);
              } else {
                evt.init(target);
              }
              return evt;
            }
            this.init(target);
          }

          Event.prototype.init = function(target) {
            this.target = target;
            this.stopped = false;
            return this.result = void 0;
          };

          Event.setCache = function(cache) {
            return eventCache = cache;
          };

          Event.prototype.end = function() {
            eventCache.push(this);
            return this.result;
          };

          Event.prototype.pop = function() {
            return eventCache.pop();
          };

          return Event;

        })(),
        setCache: Event.setCache,
        emit: function(type) {
          var args, data, er, evt, i, l, listener, listeners;
          data = this._events;
          if (data) {
            listeners = data[type];
          }
          if (!listeners && type === 'error') {
            er = arguments[1];
            if (this.domain) {
              if (!er) {
                er = new Error("Uncaught, unspecified 'error' event.");
              }
              er.domainEmitter = this;
              er.domain = this.domain;
              er.domainThrown = false;
              this.domain.emit('error', er);
            } else if (er instanceof Error) {
              throw er;
            } else {
              throw Error("Uncaught, unspecified 'error' event.");
            }
            return;
          }
          if (!listeners) {
            return;
          }
          if (this.domain && this !== process) {
            this.domain.enter();
          }
          evt = Event(this);
          if (!isObject(listeners)) {
            switch (arguments.length) {
              case 1:
                listeners.call(evt);
                break;
              case 2:
                listeners.call(evt, arguments[1]);
                break;
              case 3:
                listeners.call(evt, arguments[1], arguments[2]);
                break;
              default:
                l = arguments.length;
                args = new Array(l - 1);
                i = 0;
                while (++i < l) {
                  args[i - 1] = arguments[i];
                }
                listeners.apply(evt, args);
            }
          } else {
            l = arguments.length;
            args = new Array(l - 1);
            i = 0;
            while (++i < l) {
              args[i - 1] = arguments[i];
            }
            listeners = listeners.slice();
            i = 0;
            while ((listener = listeners[i])) {
              listener.apply(evt, args);
              if (evt.stopped) {
                break;
              }
              ++i;
            }
          }
          if (this.domain && this !== process) {
            this.domain.exit();
          }
          return evt.end();
        },
        setMaxListeners: function(n) {
          if (!isNumber(n) || n < 0 || isNaN(n)) {
            throw TypeError('n must be a positive number');
          }
          if (!this.hasOwnProperty('_maxListeners')) {
            defineProperty(this, '_maxListeners', n);
          } else {
            this._maxListeners = n;
          }
          return this;
        },
        listeners: function(type) {
          var data, result;
          data = this._events;
          if (!(data && data[type])) {
            result = [];
          } else if (isFunction(data[type])) {
            result = [data[type]];
          } else {
            result = data[type].slice();
          }
          return result;
        },
        listenerCount: function(emitter, type) {
          var data, result, reuslt;
          data = emitter._events;
          if (!(data && data[type])) {
            result = 0;
          } else if (isFunction(data[type])) {
            reuslt = 1;
          } else {
            result = data[type].length;
          }
          return result;
        },
        off: function(type, listener) {
          var candidate, data, i, listeners;
          if (!isFunction(listener)) {
            throw TypeError(listener + ' is not a function');
          }
          if (!this.hasOwnProperty('_events')) {
            return this;
          }
          data = this._events;
          if (!data[type]) {
            return this;
          }
          listeners = data[type];
          if ((listeners === listener) || (listeners.listener === listener)) {
            delete data[type];
            if (data.removeListener) {
              this.emit('removeListener', type, listener);
            }
          } else if (isObject(listeners)) {
            i = listeners.length;
            while (--i >= 0) {
              candidate = listeners[i];
              if ((candidate === listener) || (candidate.listener === listener)) {
                break;
              }
            }
            if (i < 0) {
              return this;
            }
            if (listeners.length === 1) {
              listeners.length = 0;
              delete data[type];
            } else if (listeners.length === 2) {
              data[type] = listeners[(i ? 0 : 1)];
              listeners.length = 1;
            } else {
              listeners.splice(i, 1);
            }
            if (data.removeListener) {
              this.emit('removeListener', type, listener);
            }
          }
          return this;
        },
        removeAllListeners: function(type) {
          var data, key, listeners;
          if (!this.hasOwnProperty('_events')) {
            return this;
          }
          data = this._events;
          if (!data.removeListener) {
            if (type == null) {
              delete this._events;
            } else {
              delete data[type];
            }
            return this;
          }
          if (type == null) {
            for (key in data) {
              if (key === 'removeListener') {
                continue;
              }
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            delete this._events;
            return this;
          }
          listeners = data[type];
          if (isFunction(listeners)) {
            this.removeListener(type, listeners);
          } else if (isArray(listeners)) {
            while (listeners.length && data[type]) {
              this.removeListener(type, listeners[listeners.length - 1]);
            }
          }
          delete data[type];
          return this;
        }
      });

      Eventable.defaultMaxListeners = 10;

      Eventable.listenerCount = methods.listenerCount;

      Eventable.prototype.emit = methods.emit;

      Eventable.prototype.on = methods.on;

      Eventable.prototype.addListener = methods.on;

      Eventable.prototype.off = methods.off;

      Eventable.prototype.removeListener = methods.off;

      Eventable.prototype.removeAllListeners = methods.removeAllListeners;

      Eventable.prototype.once = methods.once;

      Eventable.prototype.setMaxListeners = methods.setMaxListeners;

      Eventable.prototype.listeners = methods.listeners;

      return Eventable;

    })();
  };

  module.exports = customAbility(getEventableClass, true);

}).call(this);
