(function() {
  var Collection, Invalidator, Property, PropertyInstance, assert;

  assert = require('chai').assert;

  PropertyInstance = require('../lib/PropertyInstance');

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  Collection = require('../lib/Collection');

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
    it('should re-calcul immediately if the change option is defined', function() {
      var calculCalls, changeCalls, prop, val;
      calculCalls = 0;
      changeCalls = 0;
      val = 3;
      prop = new PropertyInstance(new Property('prop', {
        calcul: function(invalidated) {
          calculCalls += 1;
          return val += 1;
        },
        change: function(old) {
          return changeCalls += 1;
        }
      }), {});
      assert.equal(calculCalls, 0, "nb calcul calls");
      assert.equal(changeCalls, 0, "nb change calls");
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(calculCalls, 1, "nb calcul calls");
      assert.equal(changeCalls, 0, "nb change calls");
      assert.equal(prop.value, 4);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      assert.equal(calculCalls, 2, "nb calcul calls");
      assert.equal(changeCalls, 1, "nb change calls");
      assert.equal(prop.value, 5);
      assert.equal(prop.calculated, true);
      prop.get();
      assert.equal(calculCalls, 2, "nb calcul calls");
      assert.equal(changeCalls, 1, "nb change calls");
      assert.equal(prop.value, 5);
      return assert.equal(prop.calculated, true);
    });
    it('should re-calcul immediately if there is a listener on the change event', function() {
      var callcount, prop;
      callcount = 0;
      prop = new PropertyInstance(new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        }
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
    it('allow implicit target for invalidators', function() {
      var emitter, prop, res;
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
          return invalidated.prop('test');
        }
      }), emitter);
      res = prop.get();
      return assert.equal(res, 4);
    });
    it('should not edit original value of a collection property', function() {
      var original, prop, res;
      prop = new PropertyInstance(new Property('prop', {
        collection: true
      }), {});
      original = [1, 2, 3];
      prop.set(original);
      res = prop.get();
      res.push(4);
      assert.equal(res.toString(), '1,2,3,4');
      assert.equal(prop.get().toString(), '1,2,3,4');
      return assert.equal(original.toString(), '1,2,3');
    });
    it('should return collection when collection config is on', function() {
      var prop, res;
      prop = new PropertyInstance(new Property('prop', {
        collection: true,
        "default": [1, 2, 3]
      }), {});
      res = prop.get();
      assert.isTrue(res instanceof Collection);
      return assert.equal(res.toString(), '1,2,3');
    });
    it('can edit collection when no initial value', function() {
      var prop;
      prop = new PropertyInstance(new Property('prop', {
        collection: true
      }), {});
      assert.equal(prop.get().count(), 0);
      prop.get().push(4);
      assert.equal(prop.get().count(), 1);
      return assert.equal(prop.get().toString(), '4');
    });
    it('should call change function when collection changed', function() {
      var callcount, prop, res;
      callcount = 0;
      prop = new PropertyInstance(new Property('prop', {
        collection: true,
        "default": [1, 2, 3],
        change: function() {
          return callcount += 1;
        }
      }), {});
      res = prop.get();
      assert.equal(callcount, 0);
      assert.equal(res.count(), 3);
      res.push(4);
      assert.equal(res.count(), 4);
      assert.equal(res.toString(), '1,2,3,4');
      return assert.equal(callcount, 1);
    });
    it('should trigger change event when collection changed', function() {
      var emitter, prop, res;
      emitter = {
        emitEvent: function(event, params) {
          assert.equal(event, 'propChanged');
          return this.callcount += 1;
        },
        callcount: 0
      };
      prop = new PropertyInstance(new Property('prop', {
        collection: true,
        "default": [1, 2, 3]
      }), emitter);
      res = prop.get();
      assert.equal(emitter.callcount, 0);
      res.set(2, 4);
      assert.equal(res.toString(), '1,2,4');
      return assert.equal(emitter.callcount, 1);
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
