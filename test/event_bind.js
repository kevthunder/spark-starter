(function() {
  var EventBind, assert;

  assert = require('chai').assert;

  EventBind = require('../lib/EventBind');

  describe('EventBind', function() {
    it('should add listener on bind', function() {
      var bind, calls, emitter, testEvent, testListener;
      testEvent = 'test';
      testListener = function() {
        return null;
      };
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.equal(evt, testEvent);
          assert.equal(listener, testListener);
          return calls += 1;
        }
      };
      bind = new EventBind(testEvent, emitter, testListener);
      bind.bind();
      return assert.equal(calls, 1);
    });
    it('should add listener once', function() {
      var bind, calls, emitter, testEvent, testListener;
      testEvent = 'test';
      testListener = function() {
        return null;
      };
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.equal(evt, testEvent);
          assert.equal(listener, testListener);
          return calls += 1;
        }
      };
      bind = new EventBind(testEvent, emitter, testListener);
      bind.bind();
      bind.bind();
      return assert.equal(calls, 1);
    });
    return it('should remove listener on unbind', function() {
      var bind, calls, emitter, testEvent, testListener;
      testEvent = 'test';
      testListener = function() {
        return null;
      };
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          assert.equal(evt, testEvent);
          return assert.equal(listener, testListener);
        },
        removeListener: function(evt, listener) {
          assert.equal(evt, testEvent);
          assert.equal(listener, testListener);
          return calls += 1;
        }
      };
      bind = new EventBind(testEvent, emitter, testListener);
      bind.bind();
      bind.unbind();
      return assert.equal(calls, 1);
    });
  });

}).call(this);
