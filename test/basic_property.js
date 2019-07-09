(function() {
  var Invalidator, Property, Updater, assert;

  assert = require('chai').assert;

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  Updater = require('../lib/Updater');

  describe('BasicProperty', function() {
    var propEvents, updateEvents;
    propEvents = ['testInvalidated', 'testUpdated'];
    updateEvents = ['propChanged', 'propUpdated'];
    it('should flag as manual setted properties', function() {
      var prop;
      prop = new Property('prop', {}).getInstance({});
      prop.set(10);
      return assert.equal(prop.manual, true);
    });
    it('can invalidate a property that has a get function', function() {
      var prop, res;
      prop = new Property('prop', {
        get: function() {
          return 3;
        }
      }).getInstance({});
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      res = prop.get();
      assert.equal(res, 3);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      return assert.equal(prop.calculated, false);
    });
    it('should emit event when value change', function() {
      var call, prop;
      prop = new Property('prop', {
        default: 1
      }).getInstance({});
      call = 0;
      prop.on('updated', function() {
        return call++;
      });
      assert.equal(call, 0);
      prop.get();
      assert.equal(call, 1);
      prop.set(2);
      assert.equal(call, 2);
      prop.set(2);
      assert.equal(call, 2);
      prop.set(4);
      return assert.equal(call, 3);
    });
    it('should allow to alter the input value', function() {
      var prop;
      prop = new Property('prop', {
        ingest: function(val) {
          if (val === 2) {
            return 'two';
          } else {
            return val;
          }
        }
      }).getInstance({});
      prop.set(2);
      assert.equal(prop.value, 'two');
      prop.set('zero');
      return assert.equal(prop.value, 'zero');
    });
    it('can call the destroy function of an object', function() {
      var prop, val;
      prop = new Property('prop', {
        default: {
          destroy: function() {
            return this.destroyed = true;
          }
        },
        destroy: true
      }).getInstance({});
      val = prop.get();
      assert.notExists(val.destroyed);
      prop.destroy();
      return assert.isTrue(val.destroyed);
    });
    return it('can call a custom destroy function', function() {
      var prop, val;
      val = null;
      prop = new Property('prop', {
        default: {},
        destroy: function(val) {
          return val.destroyed = true;
        }
      }).getInstance({});
      val = prop.get();
      assert.notExists(val.destroyed);
      prop.destroy();
      return assert.isTrue(val.destroyed);
    });
  });

}).call(this);

//# sourceMappingURL=maps/basic_property.js.map
