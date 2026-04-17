import {assert} from "chai";
import eventEmitter from '../src/wrap-event-emitter';

describe('special-index-support', () => {
    it('should add "first" listeners at the beginning of the array', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('normal1'));
        x.on('foo', () => results.push('first1'), 'first');
        x.on('foo', () => results.push('first2'), 'first');
        
        x.emit('foo');
        // Expected order: first1, first2, normal1
        // because "earlier first ones come first within the Head zone" (H1, H2, B1)
        assert.deepEqual(results, ['first1', 'first2', 'normal1']);
    });

    it('should add "last" listeners at the end of the array', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('normal1'));
        x.on('foo', () => results.push('last1'), 'last');
        x.on('foo', () => results.push('last2'), 'last');
        
        x.emit('foo');
        // Expected order: normal1, last2, last1
        // because "earlier last ones come last" (B1, T2, T1)
        assert.deepEqual(results, ['normal1', 'last2', 'last1']);
    });

    it('should add listeners with -Infinity and Infinity as special indices', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('normal1'));
        x.on('foo', () => results.push('first1'), -Infinity);
        x.on('foo', () => results.push('last1'), Infinity);
        
        x.emit('foo');
        assert.deepEqual(results, ['first1', 'normal1', 'last1']);
    });

    it('should keep numeric index within the Body zone', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('first1'), 'first');
        x.on('foo', () => results.push('last1'), 'last');
        x.on('foo', () => results.push('normal1'));
        x.on('foo', () => results.push('normal2'), 0); // Should be at the beginning of Body zone
        x.on('foo', () => results.push('normal3'), 100); // Should be at the end of Body zone
        
        x.emit('foo');
        // Expected zones:
        // Head: [first1]
        // Body: [normal2, normal1, normal3]
        // Tail: [last1]
        assert.deepEqual(results, ['first1', 'normal2', 'normal1', 'normal3', 'last1']);
    });

    it('should update counts correctly when removing listeners', () => {
        const x = eventEmitter();
        const results = [];
        const first1 = () => results.push('first1');
        const normal1 = () => results.push('normal1');
        const last1 = () => results.push('last1');
        
        x.on('foo', first1, 'first');
        x.on('foo', normal1);
        x.on('foo', last1, 'last');
        
        x.off('foo', first1);
        x.emit('foo');
        assert.deepEqual(results, ['normal1', 'last1']);
        
        results.length = 0;
        x.on('foo', first1, 'first');
        x.off('foo', last1);
        x.emit('foo');
        assert.deepEqual(results, ['first1', 'normal1']);
    });

    it('should support "once" with special indices', async () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('normal1'));
        x.once('foo', () => results.push('first_once'), 'first');
        x.once('foo', () => results.push('last_once'), 'last');
        
        await x.emitAsync('foo');
        assert.deepEqual(results, ['first_once', 'normal1', 'last_once']);
        
        results.length = 0;
        await x.emitAsync('foo');
        assert.deepEqual(results, ['normal1']);
    });

    it('should maintain array structure when only one special listener remains', () => {
        const x = eventEmitter();
        const first1 = () => {};
        x.on('foo', first1, 'first');
        
        assert.isArray(x._events.foo, 'Should be an array even with one "first" listener');
        assert.equal(x._events.foo._headCount, 1);
        
        x.off('foo', first1);
        assert.isUndefined(x._events.foo);
    });

    it('should work with RegExp events', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on(/foo/, () => results.push('normal1'));
        x.on(/foo/, () => results.push('first1'), 'first');
        
        x.emit('foo');
        assert.deepEqual(results, ['first1', 'normal1']);
    });

    it('should decrement counts when "once" listener fires', async () => {
        const x = eventEmitter();
        const results = [];
        
        x.once('foo', () => results.push('once_first'), 'first');
        x.on('foo', () => results.push('normal1'));
        
        assert.equal(x._events.foo._headCount, 1);
        
        await x.emitAsync('foo');
        assert.deepEqual(results, ['once_first', 'normal1']);
        
        // After once fires, it calls off, which should decrement _headCount
        // Since only normal1 remains, and it's not a special listener, 
        // the array might be simplified to a function.
        if (Array.isArray(x._events.foo)) {
            assert.equal(x._events.foo._headCount || 0, 0);
        } else {
            assert.isFunction(x._events.foo);
        }
    });

    it('should handle multiple identical listeners with different indices', () => {
        const x = eventEmitter();
        const results = [];
        const L1 = () => results.push('L1');
        
        x.on('foo', L1, 'first');
        x.on('foo', L1); // normal
        
        // [L1(first), L1(normal)]
        assert.equal(x._events.foo._headCount, 1);
        assert.equal(x._events.foo.length, 2);
        
        x.off('foo', L1); // Should remove the last one (normal)
        assert.equal(x._events.foo._headCount, 1, 'Should still have first listener');
        assert.equal(x._events.foo.length, 1);
        
        results.length = 0;
        x.emit('foo');
        assert.deepEqual(results, ['L1']);
    });

    it('should handle complex mixed insertions and deletions', () => {
        const x = eventEmitter();
        const results = [];
        
        const h1 = () => results.push('h1');
        const h2 = () => results.push('h2');
        const b1 = () => results.push('b1');
        const t1 = () => results.push('t1');
        const t2 = () => results.push('t2');

        x.on('foo', b1);
        x.on('foo', h1, 'first');
        x.on('foo', t1, 'last');
        x.on('foo', h2, 'first');
        x.on('foo', t2, 'last');

        // Expected: [h1, h2, b1, t2, t1]
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'h2', 'b1', 't2', 't1']);

        results.length = 0;
        x.off('foo', h1);
        x.off('foo', t1);
        // Expected: [h2, b1, t2]
        x.emit('foo');
        assert.deepEqual(results, ['h2', 'b1', 't2']);
        assert.equal(x._events.foo._headCount, 1);
        assert.equal(x._events.foo._tailCount, 1);
    });

    it('should clamp numeric indices to the Body zone', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('h1'), 'first');
        x.on('foo', () => results.push('t1'), 'last');
        
        // Body zone is empty here. Index -100 or 100 should still stay in Body zone (between h1 and t1)
        x.on('foo', () => results.push('b1'), -100); 
        x.on('foo', () => results.push('b2'), 100);
        
        // Expected: [h1, b1, b2, t1]
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'b1', 'b2', 't1']);
    });

    it('should fire "newListener" event correctly', () => {
        const x = eventEmitter();
        const results = [];
        x.on('newListener', (type, listener) => {
            results.push({type, listener});
        });
        
        const L1 = () => {};
        x.on('foo', L1, 'first');
        
        assert.equal(results.length, 1);
        assert.equal(results[0].type, 'foo');
        assert.equal(results[0].listener, L1);
    });

    it('should return listeners in correct order via listeners()', () => {
        const x = eventEmitter();
        const h1 = () => {};
        const b1 = () => {};
        const t1 = () => {};
        
        x.on('foo', b1);
        x.on('foo', h1, 'first');
        x.on('foo', t1, 'last');
        
        const list = x.listeners('foo');
        assert.deepEqual(list, [h1, b1, t1]);
    });

    it('should isolate counts between different event types', () => {
        const x = eventEmitter();
        x.on('foo', () => {}, 'first');
        x.on('bar', () => {}, 'last');
        
        assert.equal(x._events.foo._headCount, 1);
        assert.isUndefined(x._events.foo._tailCount);
        
        assert.equal(x._events.bar._tailCount, 1);
        assert.isUndefined(x._events.bar._headCount);
    });

    it('should handle index being a string but not "first" or "last"', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('h1'), 'first');
        x.on('foo', () => results.push('t1'), 'last');
        x.on('foo', () => results.push('other'), 'random_string');
        
        // Non-number and non-special string should fallback to end of Body zone
        // Expected: [h1, other, t1]
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'other', 't1']);
    });

    it('should clean up completely with removeAllListeners', () => {
        const x = eventEmitter();
        x.on('foo', () => {}, 'first');
        x.on('foo', () => {}, 'last');
        
        x.removeAllListeners('foo');
        assert.isUndefined(x._events.foo);
    });

    it('should return correct listenerCount', () => {
        const x = eventEmitter();
        x.on('foo', () => {}, 'first');
        x.on('foo', () => {});
        x.on('foo', () => {}, 'last');
        
        assert.equal(x.listenerCount('foo'), 3);
    });

    it('should work when injected via eventable', () => {
        const eventable = require('../src/eventable').default;
        class MyClass {}
        eventable(MyClass);
        const x = new MyClass();
        const results = [];
        
        x.on('foo', () => results.push('normal'));
        x.on('foo', () => results.push('first'), 'first');
        
        x.emit('foo');
        assert.deepEqual(results, ['first', 'normal']);
    });

    it('should handle multiple "once" special listeners firing in sequence', async () => {
        const x = eventEmitter();
        const results = [];
        
        x.once('foo', () => results.push('f1'), 'first');
        x.once('foo', () => results.push('f2'), 'first');
        x.on('foo', () => results.push('n1'));
        
        assert.equal(x._events.foo._headCount, 2);
        
        await x.emitAsync('foo');
        assert.deepEqual(results, ['f1', 'f2', 'n1']);
        
        if (Array.isArray(x._events.foo)) {
            assert.equal(x._events.foo._headCount || 0, 0);
        } else {
            assert.isFunction(x._events.foo);
        }
    });

    it('should NOT decrement counts when off() fails to find listener', () => {
        const x = eventEmitter();
        x.on('foo', () => {}, 'first');
        assert.equal(x._events.foo._headCount, 1);
        
        x.off('foo', () => {}); // Different function
        assert.equal(x._events.foo._headCount, 1);
    });

    it('should handle LIFO removal of identical listeners across zones', () => {
        const x = eventEmitter();
        const results = [];
        const L1 = () => results.push('L1');
        
        x.on('foo', L1, 'first');
        x.on('foo', L1, 'last');
        
        // Array: [L1(first), L1(last)], _headCount: 1, _tailCount: 1
        assert.equal(x._events.foo._headCount, 1);
        assert.equal(x._events.foo._tailCount, 1);
        
        x.off('foo', L1); // Should remove from Tail first (last added in search order)
        assert.equal(x._events.foo._headCount, 1, 'Head count should remain');
        assert.equal(x._events.foo._tailCount, 0, 'Tail count should be 0');
        
        results.length = 0;
        x.emit('foo');
        assert.deepEqual(results, ['L1']);
    });

    it('should respect maxListeners and warn correctly with special indices', () => {
        const x = eventEmitter();
        x.setMaxListeners(1);
        
        const consoleSpy = [];
        const originalError = console.error;
        console.error = (msg) => consoleSpy.push(msg);
        
        try {
            x.on('foo', () => {}, 'first');
            x.on('foo', () => {}, 'last'); // This is the 2nd listener, should warn
            
            assert.isTrue(consoleSpy.some(m => m.includes('possible EventEmitter memory leak detected')), 'Should log warning');
        } finally {
            console.error = originalError;
        }
    });

    it('should allow normal listeners to be added correctly after clearing special zones', () => {
        const x = eventEmitter();
        const L1 = () => {};
        x.on('foo', L1, 'first');
        x.off('foo', L1);
        
        // Now foo should be cleaned up. Add a normal one.
        x.on('foo', () => {});
        assert.isFunction(x._events.foo, 'Should simplify to function because no special counts exist');
    });

    it('should clean up counts when a "once" listener is manually removed before firing', () => {
        const x = eventEmitter();
        const L1 = () => {};
        x.once('foo', L1, 'first');
        
        assert.equal(x._events.foo._headCount, 1);
        x.off('foo', L1); // The once wrapper should be found and removed
        
        assert.isUndefined(x._events.foo, 'Should be completely removed');
    });

    it('should isolate special zones in prototype inheritance', () => {
        const Parent = eventEmitter();
        const child = Object.create(Parent);
        
        Parent.on('foo', () => {}, 'first');
        child.on('foo', () => {}, 'first');
        
        assert.equal(Parent._events.foo._headCount, 1);
        assert.equal(child._events.foo._headCount, 1);
        assert.notEqual(Parent._events, child._events, 'Should have own _events');
    });

    it('should handle NaN and null as undefined index', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('h1'), 'first');
        x.on('foo', () => results.push('t1'), 'last');
        x.on('foo', () => results.push('v1'), NaN);
        x.on('foo', () => results.push('v2'), null);
        
        // Both v1 and v2 should go to the end of Body zone
        // Expected: [h1, v1, v2, t1]
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'v1', 'v2', 't1']);
    });

    it('should work through parallel() proxy', () => {
        const x = eventEmitter();
        const results = [];
        const px = x.parallel();
        
        px.on('foo', () => results.push('normal'));
        px.on('foo', () => results.push('first'), 'first');
        
        px.emit('foo'); // Proxy creates its own _events when on() is called
        assert.deepEqual(results, ['first', 'normal']);
    });

    it('should isolate counts between String and RegExp listeners', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('str_first'), 'first');
        x.on(/foo/, () => results.push('reg_first'), 'first');
        
        // Internal structure:
        // _events['foo'] has its own _headCount
        // _events[RegExpSymbol]['/foo/'] has its own _headCount
        assert.equal(x._events.foo._headCount, 1);
        
        const {RegExpEventSymbol} = require('../src/consts');
        const regEvents = x._events[RegExpEventSymbol];
        assert.equal(regEvents['/foo/']._headCount, 1);
        
        x.emit('foo');
        // _emit logic: first normal listeners (which includes first/last logic), then matching RegExp listeners
        // Order: [str_first, reg_first]
        assert.deepEqual(results, ['str_first', 'reg_first']);
    });

    it('should insert Body index 0 after all Head listeners', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('h1'), 'first');
        x.on('foo', () => results.push('h2'), 'first');
        x.on('foo', () => results.push('b1'), 0); // Should be after h1, h2
        
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'h2', 'b1']);
    });

    it('should NOT decrement counts when removing a Body listener', () => {
        const x = eventEmitter();
        const b1 = () => {};
        
        x.on('foo', () => {}, 'first');
        x.on('foo', b1);
        x.on('foo', () => {}, 'last');
        
        assert.equal(x._events.foo._headCount, 1);
        assert.equal(x._events.foo._tailCount, 1);
        
        x.off('foo', b1);
        assert.equal(x._events.foo._headCount, 1, 'Head count should remain 1');
        assert.equal(x._events.foo._tailCount, 1, 'Tail count should remain 1');
    });

    it('should retain array structure when 2 listeners become 1 special listener', () => {
        const x = eventEmitter();
        const b1 = () => {};
        const h1 = () => {};
        
        x.on('foo', h1, 'first');
        x.on('foo', b1);
        
        assert.isArray(x._events.foo);
        x.off('foo', b1);
        
        assert.isArray(x._events.foo, 'Should still be an array to preserve _headCount');
        assert.equal(x._events.foo._headCount, 1);
    });

    it('should clamp very large negative index to the beginning of Body zone', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('h1'), 'first');
        x.on('foo', () => results.push('b1'));
        x.on('foo', () => results.push('b2'), -1000); // Should be before b1 but after h1
        
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'b2', 'b1']);
    });

    it('should handle empty and refill cycle for Head zone', () => {
        const x = eventEmitter();
        const results = [];
        const h1 = () => results.push('h1');
        
        x.on('foo', h1, 'first');
        x.off('foo', h1);
        assert.isUndefined(x._events.foo);
        
        x.on('foo', () => results.push('b1'));
        x.on('foo', h1, 'first');
        
        // Expected: [h1, b1]
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'b1']);
        assert.equal(x._events.foo._headCount, 1);
    });

    it('should handle non-integer numeric indices by clamping them to Body zone', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('h1'), 'first');
        x.on('foo', () => results.push('t1'), 'last');
        x.on('foo', () => results.push('b1'), 0.5); // Should be after h1
        
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'b1', 't1']);
    });

    it('should handle LIFO removal within Head zone for identical listeners', () => {
        const x = eventEmitter();
        const results = [];
        const L1 = () => results.push('L1');
        
        x.on('foo', L1, 'first'); // H1
        x.on('foo', L1, 'first'); // H2
        
        assert.equal(x._events.foo._headCount, 2);
        x.off('foo', L1); // Should remove H2 (last added)
        
        assert.equal(x._events.foo._headCount, 1);
        results.length = 0;
        x.emit('foo');
        assert.deepEqual(results, ['L1']);
    });

    it('should clamp very large positive index to the end of Body zone', () => {
        const x = eventEmitter();
        const results = [];
        
        x.on('foo', () => results.push('h1'), 'first');
        x.on('foo', () => results.push('t1'), 'last');
        x.on('foo', () => results.push('b1'), 1000); // Should be after all Body, but before t1
        
        x.emit('foo');
        assert.deepEqual(results, ['h1', 'b1', 't1']);
    });
});
