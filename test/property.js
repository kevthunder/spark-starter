(function() {
  var EventEmitter, Invalidator, Property, assert;

  assert = require('chai').assert;

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  EventEmitter = require('../lib/EventEmitter');

  describe('Property', function() {
    it('should define a property', function() {
      var obj, prop;
      prop = new Property('foo', {
        default: 'hello'
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
        default: 'hello'
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
        default: 7
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
    it('cant set read-only property', function() {
      var obj, prop;
      prop = new Property('prop', {
        set: false,
        default: 7
      });
      obj = {};
      prop.bind(obj);
      obj.prop = 9;
      assert.equal(obj.prop, 7);
      return assert.isNotFunction(obj.setProp);
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

//# sourceMappingURL=maps/property.js.map
