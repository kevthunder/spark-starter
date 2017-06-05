(function() {
  var Invalidator, Property, PropertyInstance, assert;

  assert = require('chai').assert;

  PropertyInstance = require('../lib/PropertyInstance');

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  describe('PropertyInstance', function() {
    it('should be able to invalidate a property', function() {
      var prop;
      prop = new PropertyInstance(new Property('prop', {
        calcul: function() {
          return 3;
        }
      }), {});
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      assert.equal(prop.value, 3);
      return assert.equal(prop.calculated, false);
    });
    it('should be able to invalidate a property from an event', function() {
      var emitter, prop;
      emitter = {
        addListener: function(evt, listener) {
          this.event = evt;
          return this.listener = listener;
        },
        removeListener: function(evt, listener) {
          this.event = null;
          return this.listener = null;
        },
        emit: function() {
          if (this.listener != null) {
            return this.listener();
          }
        }
      };
      prop = new PropertyInstance(new Property('prop', {
        calcul: function(invalidated) {
          invalidated.event('testChanged', emitter);
          return 3;
        }
      }), {});
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false, 'calculated initially false');
      prop.get();
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true, 'calculated true after get');
      emitter.emit();
      assert.equal(prop.value, 3);
      return assert.equal(prop.calculated, false, 'calculated false after invalidation');
    });
    it('should re-calcul only on the next get after an invalidation', function() {
      var callcount, prop;
      callcount = 0;
      prop = new PropertyInstance(new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        }
      }), {});
      assert.equal(callcount, 0);
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(callcount, 1);
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      assert.equal(callcount, 1);
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(callcount, 2);
      assert.equal(prop.value, 3);
      return assert.equal(prop.calculated, true);
    });
    it('should re-calcul immediately when the option is true', function() {
      var callcount, prop;
      callcount = 0;
      prop = new PropertyInstance(new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        },
        immediate: true
      }), {});
      assert.equal(callcount, 0);
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(callcount, 1);
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      assert.equal(callcount, 2);
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true);
      prop.get();
      assert.equal(callcount, 2);
      assert.equal(prop.value, 3);
      return assert.equal(prop.calculated, true);
    });
    it('should re-calcul immediately if there is a listener on the change event', function() {
      var callcount, prop;
      callcount = 0;
      prop = new PropertyInstance(new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        },
        immediate: true
      }), {
        getListeners: function() {
          return [{}];
        }
      });
      assert.equal(callcount, 0);
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(callcount, 1);
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      assert.equal(callcount, 2);
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true);
      prop.get();
      assert.equal(callcount, 2);
      assert.equal(prop.value, 3);
      return assert.equal(prop.calculated, true);
    });
    it('keeps properties invalidators', function() {
      var emitter, prop;
      emitter = {
        addListener: function(evt, listener) {
          return assert.equal(evt, 'testChanged');
        },
        removeListener: function(evt, listener) {
          return assert.equal(evt, 'testChanged');
        },
        test: 4
      };
      prop = new PropertyInstance(new Property('prop', {
        calcul: function(invalidated) {
          return invalidated.prop('test', emitter);
        }
      }), {});
      prop.get();
      return assert.instanceOf(prop.invalidator, Invalidator);
    });
    return it('should allow to alter the input value', function() {
      var prop;
      prop = new PropertyInstance(new Property('prop', {
        ingest: function(val) {
          if (val === 2) {
            return 'two';
          } else {
            return val;
          }
        }
      }), {});
      prop.set(2);
      assert.equal(prop.value, 'two');
      prop.set('zero');
      return assert.equal(prop.value, 'zero');
    });
  });

}).call(this);
