import {assert} from "chai";
import {inherits} from 'inherits-ex';

import eventable from '../src/eventable'

describe('eventable', () => {
  it('should include methods', function(){
    var My = function(){};
    eventable(My, {include: ['on', 'off', '@listenerCount']});
    var keys = Object.keys(My);
    assert.deepEqual(keys, ['listenerCount']);
    keys = Object.keys(My.prototype);
    assert.deepEqual(keys, ['on','off']);
  });

  it('should include one method', function(){
    var My = function(){};
    eventable(My, {include: 'on'});
    var keys = Object.keys(My);
    assert.deepEqual(keys, []);
    keys = Object.keys(My.prototype);
    assert.deepEqual(keys, ['on']);
  });

  it('should exclude methods', function(){
    var My = function(){};
    eventable(My, {exclude: ['on', 'off']});
    var keys = Object.keys(My.prototype);
    keys.sort();
    assert.deepEqual(keys, [
      'emit',
      'emitAsync',
      'addListener',
      'listenerCount',
      'removeListener',
      'removeAllListeners',
      'once',
      'setMaxListeners',
      'listeners',
      'configure',
      'parallel',
      'setEmitterOptions',
    ].sort());
  });

  it('should exclude one method', function(){
    var My = function(){};
    eventable(My, {exclude: 'on'});
    var keys = Object.keys(My.prototype).sort();
    assert.deepEqual(keys, [
      'emit',
      'emitAsync',
      'addListener',
      'listenerCount',
      'removeListener',
      'removeAllListeners',
      'once',
      'off',
      'setMaxListeners',
      'listeners',
      'configure',
      'parallel',
      'setEmitterOptions',
    ].sort());
  });

  it('should include and exclude methods', function(){
    var My = function(){};
    eventable(My, {include: ['on', 'off'], exclude:['emit', 'emitAsync']});
    var keys = Object.keys(My.prototype).sort();
    assert.deepEqual(keys, [
      'addListener',
      'listenerCount',
      'removeListener',
      'removeAllListeners',
      'once',
      'on',
      'off',
      'setMaxListeners',
      'listeners',
      'configure',
      'parallel',
      'setEmitterOptions',
    ].sort());
  });

  it('should inject methods', function(){
    var My = function(){};
    var oldExec, newExec;
    My.prototype.exec = function(){
      oldExec = true;
    };
    eventable(My, {methods: {exec: function(){newExec=true;this['super']();}}});
    var my = new My;
    my.exec();
    assert.equal(oldExec, true, 'should execute the original func');
    assert.equal(newExec, true, 'should execute the new func');
    my.emit('none')
  });

  it('should not inject methods twice', function(){
    var newExec = 0;
    var oldExec = 0;
    var Root = function(){};
    Root.prototype.exec = function(){
      oldExec++;
    };
    var My = function(){};
    inherits(My, Root);
    eventable(Root, {methods: {exec: function(){newExec++;this['super']();}}});
    eventable(My, {methods: {exec: function(){newExec++;this['super']();}}});
    var my = new My;
    my.exec();
    assert.equal(oldExec, 1, 'should execute the original func once');
    assert.equal(newExec, 1, 'should execute the new func once');
  });
});

