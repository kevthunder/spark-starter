(function() {
  var EventEmitter, Invalidator, Property, assert;

  assert = require('chai').assert;

  Invalidator = require('../lib/Invalidator');

  EventEmitter = require('../lib/EventEmitter');

  Property = require('../lib/Property');

  describe('Invalidator', function() {
    var propEvents;
    propEvents = ['testInvalidated', 'testUpdated'];
    afterEach(function() {
      return Invalidator.strict = true;
    });
    it('can invalidate a object property', function() {
      var calls, invalidator, prop;
      calls = 0;
      prop = {
        invalidate: function() {
          return calls++;
        }
      };
      invalidator = new Invalidator(prop);
      assert.equal(calls, 0);
      invalidator.invalidate();
      return assert.equal(calls, 1);
    });
    it('can invalidate a function property', function() {
      var calls, invalidator, prop;
      calls = 0;
      prop = function() {
        return calls++;
      };
      invalidator = new Invalidator(prop);
      assert.equal(calls, 0);
      invalidator.invalidate();
      return assert.equal(calls, 1);
    });
    it('can invalidate through a callback', function() {
      var calls, invalidator;
      calls = 0;
      invalidator = new Invalidator();
      invalidator.callback = function() {
        return calls++;
      };
      assert.equal(calls, 0);
      invalidator.invalidate();
      return assert.equal(calls, 1);
    });
    it('tolerate having nothing to invalidate', function() {
      var invalidator;
      invalidator = new Invalidator();
      assert.isFalse(invalidator.invalid);
      invalidator.invalidate();
      assert.isTrue(invalidator.invalid);
      invalidator.bind();
      return assert.isFalse(invalidator.invalid);
    });
    it('should remove old value with invalidate', function() {
      var invalidated, invalidator;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      assert.equal(invalidated.test, 1);
      invalidator.invalidate();
      return assert.equal(invalidated.test, null);
    });
    it('should call invalidation function with invalidate', function() {
      var calls, invalidated, invalidator;
      calls = 0;
      invalidated = {
        invalidateTest: function() {
          return calls += 1;
        },
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      assert.equal(calls, 0);
      invalidator.invalidate();
      return assert.equal(calls, 1);
    });
    it('should create a bind with invalidationEvent', function() {
      var emitter, invalidated, invalidator;
      invalidated = {
        test: 1
      };
      emitter = {
        on: function() {}
      };
      invalidator = new Invalidator('test', invalidated);
      assert.equal(invalidator.invalidationEvents.length, 0);
      invalidator.event('testChanged', emitter);
      assert.equal(invalidator.invalidationEvents.length, 1);
      assert.equal(invalidator.invalidationEvents[0].event, 'testChanged');
      assert.equal(invalidator.invalidationEvents[0].target, emitter);
      return assert.equal(invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback);
    });
    it('should have a distict bind than anoter Invalidator binding the same event', function() {
      var emitter, invalidated, invalidator1, invalidator2;
      invalidated = {
        test1: 1,
        test2: 1
      };
      emitter = new EventEmitter();
      invalidator1 = new Invalidator('test1', invalidated);
      invalidator2 = new Invalidator('test2', invalidated);
      invalidator1.event('testChanged', emitter);
      invalidator2.event('testChanged', emitter);
      assert.equal(invalidator1.invalidationEvents.length, 1);
      assert.equal(invalidator2.invalidationEvents.length, 1);
      return assert.isFalse(invalidator1.invalidationEvents[0].equals(invalidator2.invalidationEvents[0]));
    });
    it('should add listener on bind', function() {
      var emitter, invalidator;
      emitter = new EventEmitter();
      invalidator = new Invalidator();
      invalidator.event('test', emitter);
      assert.equal(emitter.getListeners('test').length, 0);
      invalidator.bind();
      return assert.equal(emitter.getListeners('test').length, 1);
    });
    it('should remove listener on unbind', function() {
      var emitter, invalidator;
      emitter = new EventEmitter();
      invalidator = new Invalidator();
      invalidator.event('test', emitter);
      assert.equal(emitter.getListeners('test').length, 0);
      invalidator.bind();
      assert.equal(emitter.getListeners('test').length, 1);
      invalidator.unbind();
      return assert.equal(emitter.getListeners('test').length, 0);
    });
    it('should create a bind with invalidatedValue', function() {
      var emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      emitter = {
        on: function() {}
      };
      invalidator = new Invalidator('test', invalidated);
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.value(2, 'testChanged', emitter);
      assert.equal(res, 2);
      assert.equal(invalidator.invalidationEvents.length, 1);
      assert.equal(invalidator.invalidationEvents[0].event, 'testChanged');
      assert.equal(invalidator.invalidationEvents[0].target, emitter);
      return assert.equal(invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback);
    });
    it('can test for a property instance', function() {
      var invalidator, prop;
      prop = new Property('prop', {}).getInstance({});
      invalidator = new Invalidator();
      return assert.isTrue(invalidator.checkPropInstance(prop));
    });
    it('can test for a non-property instance', function() {
      var invalidator;
      invalidator = new Invalidator();
      return assert.isFalse(invalidator.checkPropInstance({}));
    });
    it('can create a bind with a property', function() {
      var invalidator, invalidedCalls, prop, res;
      prop = new Property('prop', {
        get: function() {
          return 3;
        }
      }).getInstance({});
      invalidedCalls = 0;
      invalidator = new Invalidator(function() {
        return invalidedCalls++;
      });
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.prop(prop);
      invalidator.bind();
      assert.equal(invalidedCalls, 0);
      assert.equal(res, 3);
      prop.changed();
      return assert.equal(invalidedCalls, 1);
    });
    it('allow to get an non-dynamic property', function() {
      var invalidator, obj, res;
      obj = {
        test: 1
      };
      invalidator = new Invalidator(null, obj);
      res = invalidator.prop('test');
      return assert.equal(res, 1);
    });
    it('throws an error when prop name is not a valid property', function() {
      var emitter, invalidated, invalidator;
      invalidated = {
        test: 1
      };
      emitter = {
        test: 2
      };
      invalidator = new Invalidator('test', invalidated);
      return assert.throws(function() {
        return invalidator.prop(emitter, 'test');
      }, 'Property must be a PropertyInstance or a string');
    });
    it('can create a bind with a property with implicit target', function() {
      var invalidator, invalidedCalls, obj, res;
      obj = {};
      new Property('test', {
        default: 3
      }).bind(obj);
      invalidedCalls = 0;
      invalidator = new Invalidator(function() {
        return invalidedCalls++;
      }, obj);
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.prop('test');
      invalidator.bind();
      assert.equal(invalidedCalls, 0);
      assert.equal(res, 3);
      obj.test = 5;
      return assert.equal(invalidedCalls, 1);
    });
    it('can bind to a property with propPath', function() {
      var invalidateCalls, invalidator, obj, res;
      obj = {};
      new Property('foo', {}).bind(obj);
      obj.foo = {};
      new Property('bar', {}).bind(obj.foo);
      obj.foo.bar = 4;
      invalidateCalls = 0;
      invalidator = new Invalidator(function() {
        return invalidateCalls++;
      }, obj);
      res = invalidator.propPath('foo.bar');
      invalidator.bind();
      assert.equal(4, res);
      assert.equal(0, invalidateCalls);
      obj.getPropertyInstance('foo').changed();
      assert.equal(1, invalidateCalls);
      obj.foo.getPropertyInstance('bar').changed();
      assert.equal(2, invalidateCalls);
      obj.foo.bar = 5;
      assert.equal(5, invalidator.propPath('foo.bar'));
      obj.foo = null;
      return assert.isNull(invalidator.propPath('foo.bar'));
    });
    it('should remove old value when the listener is triggered', function() {
      var invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      res = invalidator.prop('test');
      assert.equal(res, 1);
      invalidator.bind();
      assert.equal(invalidated.test, 1);
      invalidator.invalidate();
      return assert.equal(invalidated.test, null);
    });
    it('should reuse old bindEvent when calling recycle', function() {
      var emitter, invalidator;
      emitter = new EventEmitter();
      invalidator = new Invalidator();
      invalidator.event('test', emitter);
      assert.equal(emitter.getListeners('test').length, 0);
      invalidator.bind();
      assert.equal(emitter.getListeners('test').length, 1);
      invalidator.recycle(function(invalidator) {
        assert.equal(emitter.getListeners('test').length, 1);
        invalidator.event('test', emitter);
        return assert.equal(emitter.getListeners('test').length, 1);
      });
      invalidator.bind();
      return assert.equal(emitter.getListeners('test').length, 1);
    });
    it('should unbind old unused bindEvent after calling recycle', function() {
      var emitter, invalidator;
      emitter = new EventEmitter();
      invalidator = new Invalidator();
      invalidator.event('test', emitter);
      assert.equal(emitter.getListeners('test').length, 0);
      invalidator.bind();
      assert.equal(emitter.getListeners('test').length, 1);
      invalidator.recycle(function(invalidator) {
        return null;
      });
      return assert.equal(emitter.getListeners('test').length, 0);
    });
    it('should store unknown values', function() {
      var invalidator, invalidedCalls, obj, res;
      obj = {};
      new Property('test', {
        default: 2
      }).bind(obj);
      invalidedCalls = 0;
      invalidator = new Invalidator(null, obj);
      assert.equal(invalidator.unknowns.length, 0, "unknowns at beginning");
      res = invalidator.prop('test');
      invalidator.bind();
      assert.equal(res, 2);
      assert.equal(invalidator.unknowns.length, 0, "unknowns after call prop");
      obj.getPropertyInstance('test').trigger('invalidated');
      return assert.equal(invalidator.unknowns.length, 1, "unknowns after invalidation");
    });
    it('can be invalidated by a subfunction', function() {
      var emiter, fnCalls, invalidateCalls, invalidated, invalidator, res;
      invalidateCalls = 0;
      fnCalls = 0;
      emiter = new EventEmitter();
      invalidated = function() {
        return invalidateCalls++;
      };
      invalidator = new Invalidator(invalidated);
      assert.equal(fnCalls, 0);
      res = invalidator.funct(function(invalidator) {
        invalidator.event('invalidate', emiter);
        fnCalls += 1;
        return fnCalls;
      });
      assert.equal(res, 1, 'return');
      assert.equal(fnCalls, 1, 'fnCalls before');
      invalidator.bind();
      assert.equal(fnCalls, 1, 'fnCalls before(2)');
      assert.equal(invalidateCalls, 0, 'invalidateCalls before');
      emiter.emit('invalidate');
      assert.equal(fnCalls, 1, 'fnCalls after');
      return assert.equal(invalidateCalls, 1, 'invalidateCalls after');
    });
    it('can be marked unknown by a subfunction', function() {
      var emiter, fnCalls, invalidateCalls, invalidator, prop, res, unknownCalls;
      invalidateCalls = 0;
      unknownCalls = 0;
      fnCalls = 0;
      emiter = new EventEmitter();
      prop = {
        invalidate: function() {
          return invalidateCalls++;
        },
        unknown: function() {
          return unknownCalls++;
        }
      };
      invalidator = new Invalidator(prop);
      assert.equal(fnCalls, 0);
      res = invalidator.funct(function(invalidator) {
        invalidator.event('invalidate', emiter);
        fnCalls += 1;
        return fnCalls;
      });
      assert.equal(res, 1, 'return');
      assert.equal(fnCalls, 1, 'fnCalls before');
      invalidator.bind();
      assert.equal(fnCalls, 1, 'fnCalls before(2)');
      assert.equal(unknownCalls, 0, 'unknownCalls before');
      emiter.emit('invalidate');
      assert.equal(fnCalls, 1, 'fnCalls after');
      assert.equal(unknownCalls, 1, 'unknownCalls after');
      return assert.equal(invalidateCalls, 0, 'invalidateCalls after');
    });
    it('can be invalidated if subfunction result change', function() {
      var emiter, fnCalls, invalidateCalls, invalidator, prop, res, unknownCalls;
      invalidateCalls = 0;
      unknownCalls = 0;
      fnCalls = 0;
      emiter = new EventEmitter();
      prop = {
        invalidate: function() {
          return invalidateCalls++;
        },
        unknown: function() {
          return unknownCalls++;
        }
      };
      invalidator = new Invalidator(prop);
      assert.equal(fnCalls, 0);
      res = invalidator.funct(function(invalidator) {
        invalidator.event('invalidate', emiter);
        fnCalls += 1;
        return fnCalls;
      });
      assert.equal(res, 1, 'return');
      assert.equal(fnCalls, 1, 'fnCalls before');
      invalidator.bind();
      assert.equal(fnCalls, 1, 'fnCalls before(2)');
      assert.equal(unknownCalls, 0, 'unknownCalls before');
      emiter.emit('invalidate');
      assert.equal(fnCalls, 1, 'fnCalls after');
      assert.equal(unknownCalls, 1, 'unknownCalls after');
      assert.equal(invalidateCalls, 0, 'invalidateCalls after');
      invalidator.validateUnknowns();
      assert.equal(fnCalls, 2, 'fnCalls after');
      assert.equal(unknownCalls, 1, 'unknownCalls after');
      return assert.equal(invalidateCalls, 1, 'invalidateCalls after');
    });
    it('cannot be invalidated if subfunction result does not change', function() {
      var emiter, fnCalls, invalidateCalls, invalidator, prop, res, unknownCalls;
      invalidateCalls = 0;
      unknownCalls = 0;
      fnCalls = 0;
      emiter = new EventEmitter();
      prop = {
        invalidate: function() {
          return invalidateCalls++;
        },
        unknown: function() {
          return unknownCalls++;
        }
      };
      invalidator = new Invalidator(prop);
      assert.equal(fnCalls, 0);
      res = invalidator.funct(function(invalidator) {
        invalidator.event('invalidate', emiter);
        fnCalls += 1;
        return 1;
      });
      assert.equal(res, 1, 'return');
      assert.equal(fnCalls, 1, 'fnCalls before');
      invalidator.bind();
      assert.equal(fnCalls, 1, 'fnCalls before(2)');
      assert.equal(unknownCalls, 0, 'unknownCalls before');
      emiter.emit('invalidate');
      assert.equal(fnCalls, 1, 'fnCalls after');
      assert.equal(unknownCalls, 1, 'unknownCalls after');
      assert.equal(invalidateCalls, 0, 'invalidateCalls after');
      invalidator.validateUnknowns();
      assert.equal(fnCalls, 2, 'fnCalls after');
      assert.equal(unknownCalls, 1, 'unknownCalls after');
      return assert.equal(invalidateCalls, 0, 'invalidateCalls after');
    });
    it('should call unknown when there is a new unknown', function() {
      var invalidated, invalidator, obj, res, unknownCalls;
      obj = {};
      new Property('test', {
        default: 2
      }).bind(obj);
      unknownCalls = 0;
      invalidated = {
        unknown: function() {
          return unknownCalls += 1;
        }
      };
      invalidator = new Invalidator(invalidated, obj);
      assert.equal(invalidator.unknowns.length, 0, "unknowns at beginning");
      assert.equal(unknownCalls, 0, "unknownCalls at beginning");
      res = invalidator.prop('test');
      invalidator.bind();
      assert.equal(res, 2);
      assert.equal(invalidator.unknowns.length, 0, "unknowns after call prop");
      assert.equal(unknownCalls, 0, "unknownCalls after call prop");
      obj.getPropertyInstance('test').trigger('invalidated');
      assert.equal(invalidator.unknowns.length, 1, "unknowns after invalidation");
      return assert.equal(unknownCalls, 1, "unknownCalls after invalidation");
    });
    return it('can validate unknowns', function() {
      var getCalls, invalidator, obj, res;
      obj = {};
      getCalls = 0;
      new Property('test', {
        get: function() {
          getCalls += 1;
          return 2;
        }
      }).bind(obj);
      invalidator = new Invalidator(null, obj);
      assert.equal(invalidator.unknowns.length, 0, "unknowns at beginning");
      assert.equal(getCalls, 0, "getCalls at beginning");
      res = invalidator.prop('test');
      invalidator.bind();
      assert.equal(res, 2);
      assert.equal(invalidator.unknowns.length, 0, "unknowns after call prop");
      assert.equal(getCalls, 1, "getCalls after call prop");
      obj.getPropertyInstance('test').trigger('invalidated');
      assert.equal(invalidator.unknowns.length, 1, "unknowns after invalidation");
      assert.equal(getCalls, 1, "getCalls after invalidation");
      invalidator.validateUnknowns();
      assert.equal(invalidator.unknowns.length, 0, "unknowns after validating Unknowns");
      return assert.equal(getCalls, 2, "getCalls validating Unknowns");
    });
  });

}).call(this);

//# sourceMappingURL=maps/invalidator.js.map
