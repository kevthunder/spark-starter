(function() {
  var ComposedProperty, EventEmitter, Property, assert;

  assert = require('chai').assert;

  ComposedProperty = require('../lib/ComposedProperty');

  Property = require('../lib/Property');

  EventEmitter = require("wolfy87-eventemitter");

  describe('ComposedProperty', function() {
    it('should return collection when collection config is on', function() {
      var prop;
      prop = new Property('prop', {
        composed: true
      });
      prop = prop.getInstance({});
      return assert.instanceOf(prop, ComposedProperty);
    });
    it('should not return collection when collection config is undefined', function() {
      var prop;
      prop = new Property('prop');
      prop = prop.getInstance({});
      return assert.notInstanceOf(prop, ComposedProperty);
    });
    it('returns a value composed(and) of many values', function() {
      var prop, res;
      prop = new ComposedProperty(new Property('prop', {
        composed: true,
        members: [true, true]
      }), {});
      res = prop.get();
      assert.isTrue(res);
      prop.members.push(false);
      res = prop.get();
      return assert.isFalse(res);
    });
    it('returns a value composed(or) of many values', function() {
      var prop, res;
      prop = new ComposedProperty(new Property('prop', {
        composed: true,
        members: [false, false],
        "default": false
      }), {});
      res = prop.get();
      assert.isFalse(res);
      prop.members.push(true);
      res = prop.get();
      return assert.isTrue(res);
    });
    it('returns a value composed of many functions', function() {
      var fnFalse, fnTrue, fnTrue2, prop, res;
      fnTrue = function() {
        return true;
      };
      fnTrue2 = function() {
        return true;
      };
      fnFalse = function() {
        return false;
      };
      prop = new ComposedProperty(new Property('prop', {
        composed: true,
        members: [fnTrue, fnTrue2]
      }), {});
      res = prop.get();
      assert.isTrue(res);
      prop.members.push(fnFalse);
      res = prop.get();
      return assert.isFalse(res);
    });
    it('returns a value composed of many remote properties', function() {
      var prop, remote, res;
      remote = {
        addListener: function(evt, listener) {},
        removeListener: function(evt, listener) {}
      };
      new Property('prop1', {
        "default": true
      }).bind(remote);
      new Property('prop2', {
        "default": true
      }).bind(remote);
      new Property('prop3', {
        "default": false
      }).bind(remote);
      prop = new ComposedProperty(new Property('prop', {
        composed: true,
        members: []
      }), {});
      prop.members.addPropertyRef('prop1', remote);
      prop.members.addPropertyRef('prop2', remote);
      res = prop.get();
      assert.isTrue(res, 'result');
      prop.members.addPropertyRef('prop3', remote);
      res = prop.get();
      assert.isFalse(res, 'added property');
      prop.members.removePropertyRef('prop3', remote);
      res = prop.get();
      return assert.isTrue(res, 'removed property');
    });
    it('invalidate the result when adding a member', function() {
      var prop, res;
      prop = new ComposedProperty(new Property('prop', {
        composed: true,
        members: [true, true]
      }), {});
      assert.isFalse(prop.calculated);
      res = prop.get();
      assert.isTrue(prop.calculated);
      prop.members.push(false);
      return assert.isFalse(prop.calculated);
    });
    it('add a property for members in the object containing it', function() {
      var obj, prop;
      obj = {};
      prop = new Property('prop', {
        composed: true
      });
      prop = prop.bind(obj);
      return assert.instanceOf(obj.propMembers, ComposedProperty.Members);
    });
    return it('invalidate the result when a member is invalidated', function() {
      var prop, remote, res;
      remote = new EventEmitter();
      new Property('prop1', {
        "default": true
      }).bind(remote);
      new Property('prop2', {
        "default": true
      }).bind(remote);
      new Property('prop3', {
        "default": false
      }).bind(remote);
      prop = new ComposedProperty(new Property('prop', {
        composed: true,
        members: []
      }), {});
      prop.members.addPropertyRef('prop1', remote);
      prop.members.addPropertyRef('prop2', remote);
      assert.isFalse(prop.calculated, 'initial calculated value');
      res = prop.get();
      assert.isTrue(prop.calculated, 'calculated value after get');
      assert.equal(prop.invalidator.unknowns.length, 0, 'unknowns before invalidation');
      remote.invalidateProp2();
      return assert.isAbove(prop.invalidator.unknowns.length, 0, 'unknowns after invalidation');
    });
  });

}).call(this);