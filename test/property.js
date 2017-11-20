(function() {
  var EventEmitter, Invalidator, Property, assert;

  assert = require('chai').assert;

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  EventEmitter = require("wolfy87-eventemitter");

  describe('Property', function() {
    it('should define a property', function() {
      var obj, prop;
      prop = new Property('foo', {
        "default": 'hello'
      });
      obj = {};
      prop.bind(obj);
      assert.instanceOf(obj.getProperty("foo"), Property);
      assert.equal(obj.getProperty("foo"), prop);
      return assert.equal(obj.foo, 'hello');
    });
    it('should do nothing when binding twice', function() {
      var obj, prop;
      prop = new Property('foo', {
        "default": 'hello'
      });
      obj = {};
      prop.bind(obj);
      prop.bind(obj);
      assert.isUndefined(prop.options.parent);
      assert.instanceOf(obj.getProperty("foo"), Property);
      assert.equal(obj.getProperty("foo"), prop);
      return assert.equal(obj.foo, 'hello');
    });
    it('should get property', function() {
      var obj, prop;
      prop = new Property('prop', {
        "default": 7
      });
      obj = {};
      prop.bind(obj);
      assert.equal(obj.prop, 7);
      return assert.equal(obj.getProp(), 7);
    });
    it('should set property', function() {
      var obj, prop;
      prop = new Property('prop', {});
      obj = {};
      prop.bind(obj);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      obj.setProp(11);
      return assert.equal(obj.prop, 11);
    });
    it('should return self while using set function', function() {
      var obj, prop, res;
      prop = new Property('prop', {});
      obj = {};
      prop.bind(obj);
      res = obj.setProp(11);
      assert.equal(obj.prop, 11);
      return assert.equal(res, obj);
    });
    it('should call change only when value differ', function() {
      var obj, prop;
      prop = new Property('prop', {
        change: function() {
          return this.callcount += 1;
        }
      });
      obj = {
        callcount: 0
      };
      prop.bind(obj);
      assert.equal(obj.callcount, 0);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      assert.equal(obj.callcount, 1);
      obj.setProp(11);
      assert.equal(obj.prop, 11);
      assert.equal(obj.callcount, 2);
      obj.setProp(11);
      assert.equal(obj.prop, 11);
      return assert.equal(obj.callcount, 2);
    });
    it('should not call calcul when not active', function() {
      var calls, obj, prop, res;
      calls = 0;
      obj = {};
      prop = (new Property('prop', {
        active: false,
        calcul: function() {
          calls += 1;
          return 3;
        }
      })).bind(obj);
      assert.equal(calls, 0);
      assert.equal(obj.getPropertyInstance('prop').calculated, false);
      res = obj.prop;
      assert.isUndefined(res);
      assert.equal(calls, 0);
      return assert.equal(obj.getPropertyInstance('prop').calculated, false);
    });
    it('should not call change when not active', function() {
      var calculCalls, changeCalls, emitter, res;
      emitter = new EventEmitter();
      calculCalls = 0;
      changeCalls = 0;
      (new Property('foo', {
        "default": null
      })).bind(emitter);
      (new Property('bar', {
        "default": 'bar?'
      })).bind(emitter);
      (new Property('foobar', {
        active: function(invalidator) {
          return invalidator.prop('foo') != null;
        },
        calcul: function(invalidator) {
          calculCalls += 1;
          return invalidator.prop('foo') + invalidator.prop('bar');
        },
        change: function() {
          return changeCalls += 1;
        }
      })).bind(emitter);
      assert.equal(calculCalls, 0, 'calculCalls initial');
      assert.equal(changeCalls, 0, 'changeCalls initial');
      res = emitter.foobar;
      assert.isUndefined(res);
      assert.equal(calculCalls, 0, 'calculCalls after get');
      assert.equal(changeCalls, 0, 'changeCalls after get');
      emitter.bar = 'bar';
      assert.equal(calculCalls, 0, 'calculCalls after change bar');
      assert.equal(changeCalls, 0, 'changeCalls after change bar');
      res = emitter.foobar;
      assert.isUndefined(res);
      assert.equal(calculCalls, 0, 'calculCalls after get 2');
      assert.equal(changeCalls, 0, 'changeCalls after get 2');
      emitter.foo = 'foo';
      assert.equal(calculCalls, 1, 'calculCalls after change foo');
      assert.equal(changeCalls, 1, 'changeCalls after change foo');
      res = emitter.foobar;
      assert.equal(res, 'foobar');
      assert.equal(calculCalls, 1, 'calculCalls after get 2');
      assert.equal(changeCalls, 1, 'changeCalls after get 2');
      emitter.bar = 'bar!';
      assert.equal(calculCalls, 2, 'calculCalls after change bar 2');
      assert.equal(changeCalls, 2, 'changeCalls after change bar 2');
      res = emitter.foobar;
      assert.equal(res, 'foobar!');
      assert.equal(calculCalls, 2, 'calculCalls after get 2');
      return assert.equal(changeCalls, 2, 'changeCalls after get 2');
    });
    it('trigger change when re-activeted', function() {
      var changeCalls, emitter, res;
      emitter = new EventEmitter();
      changeCalls = 0;
      (new Property('foo', {
        "default": null
      })).bind(emitter);
      (new Property('bar', {
        active: function(invalidator) {
          return invalidator.prop('foo') != null;
        },
        change: function() {
          return changeCalls += 1;
        }
      })).bind(emitter);
      assert.equal(changeCalls, 0, 'changeCalls initial');
      res = emitter.bar;
      assert.isUndefined(res);
      assert.equal(changeCalls, 0, 'changeCalls after get');
      emitter.bar = 'hello';
      assert.equal(changeCalls, 0, 'changeCalls after set');
      emitter.foo = 'foo';
      assert.equal(changeCalls, 1, 'changeCalls after change foo');
      res = emitter.bar;
      assert.equal(res, 'hello');
      assert.equal(changeCalls, 1, 'changeCalls after get 2');
      emitter.bar = 'hey';
      return assert.equal(changeCalls, 2, 'changeCalls after set');
    });
    return it('can trigger an invalidator when initialising a property', function() {
      var calls, emitter, initiated, invalidated, invalidator, prop, res;
      emitter = new EventEmitter();
      prop = (new Property('hello', {
        calcul: function() {
          return 'hello';
        }
      })).bind(emitter);
      calls = 0;
      invalidated = {
        invalidateTest: function() {
          return calls += 1;
        },
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      assert.equal(calls, 0, 'nb calls initial');
      initiated = invalidator.propInitiated('hello', emitter);
      assert.isFalse(initiated);
      invalidator.bind();
      assert.equal(calls, 0, 'nb calls after propInitiated');
      res = emitter.hello;
      assert.equal(res, 'hello');
      assert.equal(calls, 1, 'nb calls after get');
      invalidator.recycle(function() {
        return initiated = invalidator.propInitiated('hello', emitter);
      });
      invalidator.bind();
      assert.isTrue(initiated);
      assert.equal(calls, 1, 'nb calls after propInitiated 2');
      emitter.hello = 'meh';
      return assert.equal(calls, 1, 'nb calls after set');
    });
  });

}).call(this);
