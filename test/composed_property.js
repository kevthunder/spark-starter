(function() {
  var ComposedProperty, Property, assert;

  assert = require('chai').assert;

  ComposedProperty = require('../lib/ComposedProperty');

  Property = require('../lib/Property');

  describe('ComposedProperty', function() {
    it('should return collection when collection config is on', function() {
      var prop;
      prop = new Property('prop', {
        composed: true
      });
      prop = prop.getInstance({});
      return assert.instanceOf(prop, ComposedProperty);
    });
    return it('should not return collection when collection config is undefined', function() {
      var prop;
      prop = new Property('prop');
      prop = prop.getInstance({});
      return assert.notInstanceOf(prop, ComposedProperty);
    });
  });

}).call(this);
