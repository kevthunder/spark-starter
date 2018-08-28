(function() {
  var Invalidator, Property, PropertyInstance, Updater, assert;

  assert = require('chai').assert;

  PropertyInstance = require('../lib/PropertyInstance');

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  Updater = require('../lib/Updater');

  describe('PropertyInstance', function() {
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
    return it('should allow to alter the input value', function() {
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
  });

}).call(this);

//# sourceMappingURL=maps/property_instance.js.map
