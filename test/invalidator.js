(function() {
  var Invalidator, assert;

  assert = require('chai').assert;

  Invalidator = require('../lib/Invalidator');

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
    return it('should unbind old unused bindEvent after calling recycle', function() {
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
  });

}).call(this);
