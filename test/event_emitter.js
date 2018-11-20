(function() {
  var EventEmitter, assert;

  assert = require('chai').assert;

  EventEmitter = require('../lib/EventEmitter');

  describe('EventEmitter', function() {
    it('can get All Events from an empty emitter', function() {
      var emitter, events;
      emitter = new EventEmitter();
      events = emitter.getAllEvents();
      assert.isObject(events);
      return assert.lengthOf(Object.keys(events), 0);
    });
    it('can get an Event liteners from an empty emitter', function() {
      var emitter, listeners;
      emitter = new EventEmitter();
      listeners = emitter.getListeners('foo');
      assert.isArray(listeners);
      return assert.lengthOf(listeners, 0);
    });
    it('can add listener', function() {
      var emitter, events, listeners;
      emitter = new EventEmitter();
      emitter.addListener('foo', function() {
        return 'test';
      });
      listeners = emitter.getListeners('foo');
      assert.lengthOf(listeners, 1);
      events = emitter.getAllEvents();
      return assert.lengthOf(Object.keys(events), 1);
    });
    it('can find that a listener exists', function() {
      var emitter, fn;
      fn = function() {
        return 'test';
      };
      emitter = new EventEmitter();
      emitter.addListener('foo', fn);
      return assert.isTrue(emitter.hasListener('foo', fn));
    });
    it('can\'t find a listener that does not exists', function() {
      var emitter, fn, fn2;
      fn = function() {
        return 'test';
      };
      fn2 = function() {
        return 'test';
      };
      emitter = new EventEmitter();
      emitter.addListener('foo', fn);
      return assert.isFalse(emitter.hasListener('foo', fn2));
    });
    it('can remove a listener', function() {
      var emitter, fn;
      fn = function() {
        return 'test';
      };
      emitter = new EventEmitter();
      emitter.addListener('foo', fn);
      assert.lengthOf(emitter.getListeners('foo'), 1);
      emitter.removeListener('foo', fn);
      return assert.lengthOf(emitter.getListeners('foo'), 0);
    });
    it('can emit event', function() {
      var called, emitter, fn;
      called = 0;
      fn = function() {
        return called += 1;
      };
      emitter = new EventEmitter();
      emitter.addListener('foo', fn);
      emitter.emitEvent('foo');
      return assert.equal(called, 1);
    });
    return it('insure callbacks cannot disrupt event triggering', function() {
      var emitter, fn1, fn2;
      fn1 = function() {
        fn1.called += 1;
        return emitter.removeListener('foo', fn1);
      };
      fn1.called = 0;
      fn2 = function() {
        return fn2.called += 1;
      };
      fn2.called = 0;
      emitter = new EventEmitter();
      emitter.addListener('foo', fn1);
      emitter.addListener('foo', fn2);
      emitter.emitEvent('foo');
      assert.equal(fn1.called, 1, "fn1.called");
      return assert.equal(fn2.called, 1, "fn2.called");
    });
  });

}).call(this);

//# sourceMappingURL=maps/event_emitter.js.map
