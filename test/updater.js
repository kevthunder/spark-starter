(function() {
  var Updater, assert;

  assert = require('chai').assert;

  Updater = require('../lib/Updater');

  describe('Updater', function() {
    it('can return a binder', function() {
      var binder, updater;
      updater = new Updater();
      binder = updater.getBinder();
      assert.isFunction(binder.bind);
      return assert.isFunction(binder.unbind);
    });
    it('allow to add callback', function() {
      var callback, callback2, updater;
      updater = new Updater();
      callback = function() {
        return 1;
      };
      callback2 = function() {
        return 2;
      };
      assert.equal(updater.callbacks.length, 0);
      updater.addCallback(callback);
      assert.equal(updater.callbacks[0], callback);
      assert.equal(updater.callbacks.length, 1);
      updater.addCallback(callback2);
      assert.equal(updater.callbacks[1], callback2);
      return assert.equal(updater.callbacks.length, 2);
    });
    it('allow to remove callback', function() {
      var callback, callback2, updater;
      updater = new Updater();
      callback = function() {
        return 1;
      };
      callback2 = function() {
        return 2;
      };
      assert.equal(updater.callbacks.length, 0);
      updater.addCallback(callback);
      assert.equal(updater.callbacks[0], callback);
      assert.equal(updater.callbacks.length, 1);
      updater.addCallback(callback2);
      assert.equal(updater.callbacks[1], callback2);
      assert.equal(updater.callbacks.length, 2);
      updater.removeCallback(callback);
      assert.equal(updater.callbacks.length, 1);
      updater.removeCallback(callback2);
      return assert.equal(updater.callbacks.length, 0);
    });
    it('call callback on update', function() {
      var callback, calls, updater;
      updater = new Updater();
      calls = 0;
      callback = function() {
        return calls++;
      };
      updater.addCallback(callback);
      assert.equal(calls, 0);
      updater.update();
      assert.equal(calls, 1);
      updater.update();
      return assert.equal(calls, 2);
    });
    it('allow callback to remove themselves', function() {
      var callback, callback2, calls2, updater;
      updater = new Updater();
      callback = function() {
        callback.calls++;
        return updater.removeCallback(callback);
      };
      callback.calls = 0;
      calls2 = 0;
      callback2 = function() {
        callback2.calls++;
        return updater.removeCallback(callback2);
      };
      callback2.calls = 0;
      assert.equal(updater.callbacks.length, 0);
      updater.addCallback(callback);
      updater.addCallback(callback2);
      assert.equal(updater.callbacks.length, 2);
      assert.equal(callback.calls, 0);
      assert.equal(callback2.calls, 0);
      updater.update();
      assert.equal(callback.calls, 1);
      assert.equal(callback2.calls, 1);
      assert.equal(updater.callbacks.length, 0);
      updater.update();
      assert.equal(callback.calls, 1);
      assert.equal(callback2.calls, 1);
      return assert.equal(updater.callbacks.length, 0);
    });
    it('calls callback added on the same tick', function() {
      var callback, callback2, calls2, updater;
      updater = new Updater();
      callback = function() {
        callback.calls++;
        return updater.addCallback(callback2);
      };
      callback.calls = 0;
      calls2 = 0;
      callback2 = function() {
        return callback2.calls++;
      };
      callback2.calls = 0;
      updater.addCallback(callback);
      assert.equal(updater.callbacks.length, 1);
      updater.update();
      assert.equal(callback.calls, 1);
      assert.equal(callback2.calls, 1);
      return assert.equal(updater.callbacks.length, 2);
    });
    return it('allow to add callback for the next tick', function() {
      var callback, callback2, calls2, updater;
      updater = new Updater();
      callback = function() {
        callback.calls++;
        updater.nextTick(callback2);
        return updater.removeCallback(callback);
      };
      callback.calls = 0;
      calls2 = 0;
      callback2 = function() {
        return callback2.calls++;
      };
      callback2.calls = 0;
      updater.addCallback(callback);
      assert.equal(updater.callbacks.length, 1);
      updater.update();
      assert.equal(callback.calls, 1);
      assert.equal(callback2.calls, 0);
      assert.equal(updater.callbacks.length, 1);
      updater.update();
      assert.equal(callback.calls, 1);
      assert.equal(callback2.calls, 1);
      return assert.equal(updater.callbacks.length, 1);
    });
  });

  describe('Updater.Binder', function() {
    it('adds the callback with bind', function() {
      var binder, updater;
      updater = new Updater();
      binder = updater.getBinder();
      binder.callback = function() {
        return 1;
      };
      assert.equal(updater.callbacks.length, 0);
      binder.bind();
      assert.equal(updater.callbacks[0], binder.callback);
      return assert.equal(updater.callbacks.length, 1);
    });
    return it('remove the callback with unbind', function() {
      var binder, updater;
      updater = new Updater();
      binder = updater.getBinder();
      binder.callback = function() {
        return 1;
      };
      assert.equal(updater.callbacks.length, 0);
      binder.bind();
      assert.equal(updater.callbacks[0], binder.callback);
      assert.equal(updater.callbacks.length, 1);
      binder.unbind();
      return assert.equal(updater.callbacks.length, 0);
    });
  });

}).call(this);
