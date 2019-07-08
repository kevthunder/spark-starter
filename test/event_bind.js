(function() {
  var EventBind, assert;

  assert = require('chai').assert;

  EventBind = require('../lib/EventBind');

  describe('EventBind', function() {
    it('can compare 2 EventBinds', function() {
      var bind1, bind2, bind3, calls, emitter, maker, testEvent;
      testEvent = 'test';
      maker = function(val) {
        var callback;
        callback = function() {
          return null;
        };
        callback.ref = {
          maker: arguments.callee,
          val: val
        };
        return callback;
      };
      calls = 0;
      emitter = {};
      bind1 = new EventBind(testEvent, emitter, maker(1));
      bind2 = new EventBind(testEvent, emitter, maker(1));
      bind3 = new EventBind(testEvent, emitter, maker(2));
      assert.isTrue(bind1.equals(bind2));
      return assert.isFalse(bind1.equals(bind3));
    });
    it('can compare 2 EventBinds after a change', function() {
      var bind1, bind2, calls, emitter, maker, testEvent;
      testEvent = 'test';
      maker = function(val) {
        var callback;
        callback = function() {
          return null;
        };
        callback.ref = {
          maker: arguments.callee,
          val: val
        };
        return callback;
      };
      calls = 0;
      emitter = {};
      bind1 = new EventBind(testEvent, emitter, maker(1));
      bind2 = new EventBind(testEvent, emitter, maker(1));
      assert.isTrue(bind1.equals(bind2));
      bind2.event = 'test2';
      return assert.isFalse(bind1.equals(bind2));
    });
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
    it('should add listener on bind with addEventListener', function() {
      var bind, calls, emitter, testEvent, testListener;
      testEvent = 'test';
      testListener = function() {
        return null;
      };
      calls = 0;
      emitter = {
        addEventListener: function(evt, listener) {
          assert.equal(evt, testEvent);
          assert.equal(listener, testListener);
          return calls += 1;
        }
      };
      bind = new EventBind(testEvent, emitter, testListener);
      bind.bind();
      return assert.equal(calls, 1);
    });
    it('should throw error if bind fail', function() {
      var bind, emitter, testEvent, testListener;
      testEvent = 'test';
      testListener = function() {
        return null;
      };
      emitter = {};
      bind = new EventBind(testEvent, emitter, testListener);
      return assert.throws(bind.bind.bind(bind), 'No function to add event listeners was found');
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
    it('should remove listener on unbind', function() {
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
    return it('can change event target', function() {
      var Emitter, bind, emitter1, emitter2, testListener;
      Emitter = class {
        constructor() {
          this.addCalls = 0;
          this.removeCalls = 0;
        }

        addListener(evt, listener) {
          return this.addCalls += 1;
        }

        removeListener(evt, listener) {
          return this.removeCalls += 1;
        }

      };
      testListener = function() {
        return null;
      };
      emitter1 = new Emitter();
      emitter2 = new Emitter();
      bind = new EventBind('test', null, testListener);
      assert.equal(emitter1.addCalls, 0);
      assert.equal(emitter1.removeCalls, 0);
      assert.equal(emitter2.addCalls, 0);
      assert.equal(emitter2.removeCalls, 0);
      bind.bindTo(emitter1);
      assert.equal(emitter1.addCalls, 1);
      assert.equal(emitter1.removeCalls, 0);
      assert.equal(emitter2.addCalls, 0);
      assert.equal(emitter2.removeCalls, 0);
      bind.bindTo(emitter2);
      assert.equal(emitter1.addCalls, 1);
      assert.equal(emitter1.removeCalls, 1);
      assert.equal(emitter2.addCalls, 1);
      return assert.equal(emitter2.removeCalls, 0);
    });
  });

}).call(this);

//# sourceMappingURL=maps/event_bind.js.map
