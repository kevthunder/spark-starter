(function() {
  var Invalidator, Property, PropertyInstance, Updater, assert;

  assert = require('chai').assert;

  PropertyInstance = require('../lib/PropertyInstance');

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  Updater = require('../lib/Updater');

  describe('CalculatedProperty', function() {
    var propEvents, updateEvents;
    propEvents = ['testInvalidated', 'testUpdated'];
    updateEvents = ['propChanged', 'propUpdated'];
    it('should flag as not-manual calculated properties', function() {
      var prop, res;
      prop = new Property('prop', {
        calcul: function() {
          return 3;
        }
      }).getInstance({});
      res = prop.get();
      assert.equal(res, 3);
      return assert.equal(prop.manual, false);
    });
    it('should not call calcul when using set', function() {
      var calls, prop, res;
      calls = 0;
      prop = new Property('prop', {
        calcul: function() {
          calls += 1;
          return 3;
        }
      }).getInstance({});
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.set(2);
      assert.equal(prop.value, 2);
      assert.equal(calls, 0);
      assert.equal(prop.calculated, true);
      res = prop.get();
      assert.equal(res, 2);
      assert.equal(prop.value, 2);
      assert.equal(calls, 0);
      return assert.equal(prop.calculated, true);
    });
    it('can invalidate a property', function() {
      var prop;
      prop = new Property('prop', {
        calcul: function() {
          return 3;
        }
      }).getInstance({});
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      assert.equal(prop.value, 3);
      return assert.equal(prop.calculated, false);
    });
    it('can invalidate a property from an event', function() {
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
      prop = new Property('prop', {
        calcul: function(invalidated) {
          invalidated.event('testChanged', emitter);
          return 3;
        }
      }).getInstance({});
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false, 'calculated initially false');
      prop.get();
      assert.equal(prop.value, 3);
      assert.equal(prop.calculated, true, 'calculated true after get');
      emitter.emit();
      assert.equal(prop.value, 3);
      return assert.equal(prop.calculated, false, 'calculated false after invalidation');
    });
    it('can handle indirect event target for invalidators', function() {
      var Emitter, binded, prop, val;
      val = 3;
      binded = false;
      Emitter = (function() {
        function Emitter() {}

        Emitter.prototype.addListener = function(evt, listener) {
          return binded = true;
        };

        Emitter.prototype.removeListener = function(evt, listener) {
          return binded = false;
        };

        return Emitter;

      })();
      prop = new Property('prop', {
        calcul: function(invalidated) {
          invalidated.event('testChanged', new Emitter());
          return val += 1;
        },
        immediate: true
      }).getInstance({});
      assert.equal(prop.calculated, false, 'calculated initially false');
      assert.isFalse(binded);
      prop.get();
      assert.equal(prop.calculated, true, 'calculated true after get');
      assert.isTrue(binded);
      prop.invalidate();
      assert.equal(prop.calculated, true, 'calculated false after invalidation');
      return assert.isTrue(binded, 'binded should be true after invalidation');
    });
    it('should re-calcul only on the next get after an invalidation', function() {
      var callcount, prop;
      callcount = 0;
      prop = new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        }
      }).getInstance({});
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
      prop = new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        },
        immediate: true
      }).getInstance({});
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
    it('can use a function to determine immediate re-calcul', function() {
      var callcount, prop;
      callcount = 0;
      prop = new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        },
        immediate: function() {
          return true;
        }
      }).getInstance({});
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
      prop = new Property('prop', {
        calcul: function(invalidated) {
          calculCalls += 1;
          return val += 1;
        },
        change: function(old) {
          return changeCalls += 1;
        }
      }).getInstance({});
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
    it('should use immediate function in priority to change option being defined for immediate re-calcul', function() {
      var calculCalls, changeCalls, prop, val;
      calculCalls = 0;
      changeCalls = 0;
      val = 3;
      prop = new Property('prop', {
        calcul: function(invalidated) {
          calculCalls += 1;
          return val += 1;
        },
        change: function(old) {
          return changeCalls += 1;
        },
        immediate: function() {
          return false;
        }
      }).getInstance({});
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
      assert.equal(calculCalls, 1, "nb calcul calls");
      assert.equal(changeCalls, 0, "nb change calls");
      assert.equal(prop.value, 4);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(calculCalls, 2, "nb calcul calls");
      assert.equal(changeCalls, 1, "nb change calls");
      assert.equal(prop.value, 5);
      return assert.equal(prop.calculated, true);
    });
    it('should only recalcul when the updater tells it, if it is defined', function() {
      var calculCalls, changeCalls, prop, updater, val;
      calculCalls = 0;
      changeCalls = 0;
      val = 3;
      updater = new Updater();
      prop = new Property('prop', {
        calcul: function(invalidated) {
          calculCalls += 1;
          return val += 1;
        },
        change: function(old) {
          return changeCalls += 1;
        },
        updater: updater
      }).getInstance({});
      assert.equal(calculCalls, 0, "nb calcul calls, before get");
      assert.equal(changeCalls, 0, "nb change calls, before get");
      assert.equal(prop.value, void 0);
      assert.equal(prop.calculated, false);
      prop.get();
      assert.equal(calculCalls, 1, "nb calcul calls, after get");
      assert.equal(changeCalls, 0, "nb change calls, after get");
      assert.equal(prop.value, 4);
      assert.equal(prop.calculated, true);
      prop.invalidate();
      assert.equal(calculCalls, 1, "nb calcul calls, after invalidate");
      assert.equal(changeCalls, 0, "nb change calls, after invalidate");
      assert.equal(prop.value, 4);
      assert.equal(prop.calculated, false);
      updater.update();
      assert.equal(calculCalls, 2, "nb calcul calls, after update");
      assert.equal(changeCalls, 1, "nb change calls, after update");
      assert.equal(prop.value, 5);
      return assert.equal(prop.calculated, true);
    });
    it('should re-calcul immediately if there is a listener on the change event', function() {
      var callcount, prop;
      callcount = 0;
      prop = new Property('prop', {
        calcul: function(invalidated) {
          callcount += 1;
          return 3;
        }
      }).getInstance({
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
          return assert.include(propEvents, evt);
        },
        removeListener: function(evt, listener) {
          return assert.include(propEvents, evt);
        },
        test: 4
      };
      prop = new Property('prop', {
        calcul: function(invalidated) {
          return invalidated.prop('test', emitter);
        }
      }).getInstance({});
      prop.get();
      return assert.instanceOf(prop.invalidator, Invalidator);
    });
    return it('allow implicit target for invalidators', function() {
      var emitter, prop, res;
      emitter = {
        addListener: function(evt, listener) {
          return assert.include(propEvents, evt);
        },
        removeListener: function(evt, listener) {
          return assert.include(propEvents, evt);
        },
        test: 4
      };
      prop = new Property('prop', {
        calcul: function(invalidated) {
          return invalidated.prop('test');
        }
      }).getInstance(emitter);
      res = prop.get();
      return assert.equal(res, 4);
    });
  });

}).call(this);
