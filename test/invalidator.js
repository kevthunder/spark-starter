(function() {
  var EventEmitter, Invalidator, assert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  assert = require('chai').assert;

  Invalidator = require('../lib/Invalidator');

  EventEmitter = require("wolfy87-eventemitter");

  describe('Invalidator', function() {
    var propEvents;
    propEvents = ['testInvalidated', 'testUpdated'];
    it('should create a bind with invalidationEvent', function() {
      var emitter, invalidated, invalidator;
      invalidated = {
        test: 1
      };
      emitter = {};
      invalidator = new Invalidator('test', invalidated);
      assert.equal(invalidator.invalidationEvents.length, 0);
      invalidator.event('testChanged', emitter);
      assert.equal(invalidator.invalidationEvents.length, 1);
      assert.equal(invalidator.invalidationEvents[0].event, 'testChanged');
      assert.equal(invalidator.invalidationEvents[0].target, emitter);
      return assert.equal(invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback);
    });
    it('should create a bind with invalidatedValue', function() {
      var emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      emitter = {};
      invalidator = new Invalidator('test', invalidated);
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.value(2, 'testChanged', emitter);
      assert.equal(res, 2);
      assert.equal(invalidator.invalidationEvents.length, 1);
      assert.equal(invalidator.invalidationEvents[0].event, 'testChanged');
      assert.equal(invalidator.invalidationEvents[0].target, emitter);
      return assert.equal(invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback);
    });
    it('should create a bind with invalidatedProperty', function() {
      var emitter, i, invalidated, invalidator, j, len, propEvent, res, results;
      invalidated = {
        test: 1
      };
      emitter = {
        test: 2
      };
      invalidator = new Invalidator('test', invalidated);
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.prop('test', emitter);
      assert.equal(res, 2);
      assert.equal(invalidator.invalidationEvents.length, propEvents.length);
      results = [];
      for (i = j = 0, len = propEvents.length; j < len; i = ++j) {
        propEvent = propEvents[i];
        assert.equal(invalidator.invalidationEvents[i].event, propEvent);
        assert.equal(invalidator.invalidationEvents[i].target, emitter);
        if (invalidator.invalidationEvents[i].event === 'testUpdated') {
          results.push(assert.equal(invalidator.invalidationEvents[i].callback, invalidator.invalidateCallback));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    it('should create a bind with invalidatedProperty with implicit target', function() {
      var i, invalidated, invalidator, j, len, propEvent, res, results;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.prop('test');
      assert.equal(res, 1);
      assert.equal(invalidator.invalidationEvents.length, propEvents.length);
      results = [];
      for (i = j = 0, len = propEvents.length; j < len; i = ++j) {
        propEvent = propEvents[i];
        assert.equal(invalidator.invalidationEvents[i].event, propEvent);
        assert.equal(invalidator.invalidationEvents[i].target, invalidated);
        if (invalidator.invalidationEvents[i].event === 'testUpdated') {
          results.push(assert.equal(invalidator.invalidationEvents[i].callback, invalidator.invalidateCallback));
        } else {
          results.push(void 0);
        }
      }
      return results;
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
    it('should add listener on bind', function() {
      var calls, emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.include(['testInvalidated', 'testUpdated'], evt);
          if (evt === 'testUpdated') {
            assert.equal(listener, invalidator.invalidateCallback);
          }
          return calls += 1;
        }
      };
      res = invalidator.prop('test', emitter);
      assert.equal(calls, 0);
      invalidator.bind();
      return assert.equal(calls, 2);
    });
    it('should remove listener on unbind', function() {
      var calls, emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.include(propEvents, evt);
          if (evt === 'testUpdated') {
            return assert.equal(listener, invalidator.invalidateCallback);
          }
        },
        removeListener: function(evt, listener) {
          assert.include(propEvents, evt);
          if (evt === 'testUpdated') {
            assert.equal(listener, invalidator.invalidateCallback);
          }
          return calls += 1;
        }
      };
      res = invalidator.prop('test', emitter);
      invalidator.bind();
      assert.equal(calls, 0);
      invalidator.unbind();
      return assert.equal(calls, propEvents.length);
    });
    it('should remove old value when the listener is triggered', function() {
      var emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
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
      res = invalidator.prop('test', emitter);
      invalidator.bind();
      assert.equal(invalidated.test, 1);
      emitter.emit();
      return assert.equal(invalidated.test, null);
    });
    it('should reuse old bindEvent when calling recycle', function() {
      var addCalls, emitter, invalidated, invalidator, removeCalls, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      addCalls = 0;
      removeCalls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.include(propEvents, evt);
          if (evt === 'testUpdated') {
            assert.equal(listener, invalidator.invalidateCallback);
          }
          addCalls += 1;
          this.event = evt;
          return this.listener = listener;
        },
        removeListener: function(evt, listener) {
          assert.include(propEvents, evt);
          if (evt === 'testUpdated') {
            assert.equal(listener, invalidator.invalidateCallback);
          }
          removeCalls += 1;
          this.event = null;
          return this.listener = null;
        },
        emit: function() {
          if (this.listener != null) {
            return this.listener();
          }
        }
      };
      res = invalidator.prop('test', emitter);
      assert.equal(addCalls, 0);
      assert.equal(removeCalls, 0);
      invalidator.bind();
      assert.equal(addCalls, propEvents.length);
      assert.equal(removeCalls, 0);
      invalidator.recycle(function(invalidator) {
        return invalidator.prop('test', emitter);
      });
      invalidator.bind();
      assert.equal(addCalls, propEvents.length);
      assert.equal(removeCalls, 0);
      assert.equal(invalidated.test, 1);
      emitter.emit();
      return assert.equal(invalidated.test, null);
    });
    it('should unbind old unused bindEvent after calling recycle', function() {
      var addCalls, emitter, invalidated, invalidator, removeCalls, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      addCalls = 0;
      removeCalls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.include(propEvents, evt);
          if (evt === 'testUpdated') {
            assert.equal(listener, invalidator.invalidateCallback);
          }
          addCalls += 1;
          this.event = evt;
          return this.listener = listener;
        },
        removeListener: function(evt, listener) {
          assert.include(propEvents, evt);
          if (evt === 'testUpdated') {
            assert.equal(listener, invalidator.invalidateCallback);
          }
          removeCalls += 1;
          this.event = null;
          return this.listener = null;
        },
        emit: function() {
          if (this.listener != null) {
            return this.listener();
          }
        }
      };
      res = invalidator.prop('test', emitter);
      assert.equal(addCalls, 0);
      assert.equal(removeCalls, 0);
      invalidator.bind();
      assert.equal(addCalls, propEvents.length);
      assert.equal(removeCalls, 0);
      invalidator.recycle(function(invalidator) {
        return null;
      });
      invalidator.bind();
      assert.equal(addCalls, propEvents.length);
      assert.equal(removeCalls, propEvents.length);
      assert.equal(invalidated.test, 1);
      emitter.emit();
      return assert.equal(invalidated.test, 1);
    });
    it('should store unknown values', function() {
      var Source, invalidated, invalidator, res, source;
      Source = (function(superClass) {
        extend(Source, superClass);

        function Source() {
          this.test = 2;
        }

        return Source;

      })(EventEmitter);
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      source = new Source();
      assert.equal(invalidator.unknowns.length, 0, "unknowns at beginning");
      res = invalidator.prop('test', source);
      invalidator.bind();
      assert.equal(res, 2);
      assert.equal(invalidator.unknowns.length, 0, "unknowns after call prop");
      source.emit('testInvalidated');
      return assert.equal(invalidator.unknowns.length, 1, "unknowns after invalidation");
    });
    it('should call unknown when there is a new unknown', function() {
      var Source, invalidated, invalidator, res, source, unknownCalls;
      unknownCalls = 0;
      Source = (function(superClass) {
        extend(Source, superClass);

        function Source() {
          this.test = 2;
        }

        return Source;

      })(EventEmitter);
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      invalidator.unknown = function() {
        return unknownCalls += 1;
      };
      source = new Source();
      assert.equal(invalidator.unknowns.length, 0, "unknowns at beginning");
      assert.equal(unknownCalls, 0, "unknownCalls at beginning");
      res = invalidator.prop('test', source);
      invalidator.bind();
      assert.equal(res, 2);
      assert.equal(invalidator.unknowns.length, 0, "unknowns after call prop");
      assert.equal(unknownCalls, 0, "unknownCalls after call prop");
      source.emit('testInvalidated');
      assert.equal(invalidator.unknowns.length, 1, "unknowns after invalidation");
      return assert.equal(unknownCalls, 1, "unknownCalls after invalidation");
    });
    return it('can validate unknowns', function() {
      var Source, invalidated, invalidator, res, source;
      Source = (function(superClass) {
        extend(Source, superClass);

        function Source() {
          this.getCalls = 0;
          Object.defineProperty(this, 'test', {
            get: function() {
              this.getCalls += 1;
              return 2;
            }
          });
        }

        return Source;

      })(EventEmitter);
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator('test', invalidated);
      source = new Source();
      assert.equal(invalidator.unknowns.length, 0, "unknowns at beginning");
      assert.equal(source.getCalls, 0, "getCalls at beginning");
      res = invalidator.prop('test', source);
      invalidator.bind();
      assert.equal(res, 2);
      assert.equal(invalidator.unknowns.length, 0, "unknowns after call prop");
      assert.equal(source.getCalls, 1, "getCalls after call prop");
      source.emit('testInvalidated');
      assert.equal(invalidator.unknowns.length, 1, "unknowns after invalidation");
      assert.equal(source.getCalls, 1, "getCalls after invalidation");
      invalidator.validateUnknowns();
      assert.equal(invalidator.unknowns.length, 0, "unknowns after validating Unknowns");
      return assert.equal(source.getCalls, 2, "getCalls validating Unknowns");
    });
  });

}).call(this);
