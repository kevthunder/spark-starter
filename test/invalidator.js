(function() {
  var Invalidator, assert;

  assert = require('chai').assert;

  Invalidator = require('../lib/Invalidator');

  describe('Invalidator', function() {
    it('should create a bind with invalidationEvent', function() {
      var emitter, invalidated, invalidator;
      invalidated = {
        test: 1
      };
      emitter = {};
      invalidator = new Invalidator(invalidated, 'test');
      assert.equal(invalidator.invalidationEvents.length, 0);
      invalidator.fromEvent('changedTest', emitter);
      assert.equal(invalidator.invalidationEvents.length, 1);
      assert.equal(invalidator.invalidationEvents[0].event, 'changedTest');
      assert.equal(invalidator.invalidationEvents[0].target, emitter);
      return assert.equal(invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback);
    });
    it('should create a bind with invalidatedValue', function() {
      var emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      emitter = {};
      invalidator = new Invalidator(invalidated, 'test');
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.fromValue(2, 'changedTest', emitter);
      assert.equal(res, 2);
      assert.equal(invalidator.invalidationEvents.length, 1);
      assert.equal(invalidator.invalidationEvents[0].event, 'changedTest');
      assert.equal(invalidator.invalidationEvents[0].target, emitter);
      return assert.equal(invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback);
    });
    it('should create a bind with invalidatedProperty', function() {
      var emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      emitter = {
        test: 2
      };
      invalidator = new Invalidator(invalidated, 'test');
      assert.equal(invalidator.invalidationEvents.length, 0);
      res = invalidator.fromProperty('test', emitter);
      assert.equal(res, 2);
      assert.equal(invalidator.invalidationEvents.length, 1);
      assert.equal(invalidator.invalidationEvents[0].event, 'changedTest');
      assert.equal(invalidator.invalidationEvents[0].target, emitter);
      return assert.equal(invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback);
    });
    it('should remove old value with invalidate', function() {
      var invalidated, invalidator;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator(invalidated, 'test');
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
      invalidator = new Invalidator(invalidated, 'test');
      assert.equal(calls, 0);
      invalidator.invalidate();
      return assert.equal(calls, 1);
    });
    it('should add listener on bind', function() {
      var calls, emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator(invalidated, 'test');
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.equal(evt, 'changedTest');
          assert.equal(listener, invalidator.invalidateCallback);
          return calls += 1;
        }
      };
      res = invalidator.fromProperty('test', emitter);
      assert.equal(calls, 0);
      invalidator.bind();
      return assert.equal(calls, 1);
    });
    it('should remove listener on unbind', function() {
      var calls, emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator(invalidated, 'test');
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.equal(evt, 'changedTest');
          return assert.equal(listener, invalidator.invalidateCallback);
        },
        removeListener: function(evt, listener) {
          assert.equal(evt, 'changedTest');
          assert.equal(listener, invalidator.invalidateCallback);
          return calls += 1;
        }
      };
      res = invalidator.fromProperty('test', emitter);
      invalidator.bind();
      assert.equal(calls, 0);
      invalidator.unbind();
      return assert.equal(calls, 1);
    });
    it('should remove old value when the listener is triggered', function() {
      var emitter, invalidated, invalidator, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator(invalidated, 'test');
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
      res = invalidator.fromProperty('test', emitter);
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
      invalidator = new Invalidator(invalidated, 'test');
      addCalls = 0;
      removeCalls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.equal(evt, 'changedTest');
          assert.equal(listener, invalidator.invalidateCallback);
          addCalls += 1;
          this.event = evt;
          return this.listener = listener;
        },
        removeListener: function(evt, listener) {
          assert.equal(evt, 'changedTest');
          assert.equal(listener, invalidator.invalidateCallback);
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
      res = invalidator.fromProperty('test', emitter);
      assert.equal(addCalls, 0);
      assert.equal(removeCalls, 0);
      invalidator.bind();
      assert.equal(addCalls, 1);
      assert.equal(removeCalls, 0);
      invalidator.recycle(function(invalidator) {
        return invalidator.fromProperty('test', emitter);
      });
      invalidator.bind();
      assert.equal(addCalls, 1);
      assert.equal(removeCalls, 0);
      assert.equal(invalidated.test, 1);
      emitter.emit();
      return assert.equal(invalidated.test, null);
    });
    return it('should unbind old unused bindEvent after calling recycle', function() {
      var addCalls, emitter, invalidated, invalidator, removeCalls, res;
      invalidated = {
        test: 1
      };
      invalidator = new Invalidator(invalidated, 'test');
      addCalls = 0;
      removeCalls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.equal(evt, 'changedTest');
          assert.equal(listener, invalidator.invalidateCallback);
          addCalls += 1;
          this.event = evt;
          return this.listener = listener;
        },
        removeListener: function(evt, listener) {
          assert.equal(evt, 'changedTest');
          assert.equal(listener, invalidator.invalidateCallback);
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
      res = invalidator.fromProperty('test', emitter);
      assert.equal(addCalls, 0);
      assert.equal(removeCalls, 0);
      invalidator.bind();
      assert.equal(addCalls, 1);
      assert.equal(removeCalls, 0);
      invalidator.recycle(function(invalidator) {
        return null;
      });
      invalidator.bind();
      assert.equal(addCalls, 1);
      assert.equal(removeCalls, 1);
      assert.equal(invalidated.test, 1);
      emitter.emit();
      return assert.equal(invalidated.test, 1);
    });
  });

}).call(this);
