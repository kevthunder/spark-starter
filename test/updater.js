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
      var callback, updater;
      updater = new Updater();
      callback = function() {
        return 1;
      };
      assert.equal(updater.callbacks.length, 0);
      updater.addCallback(callback);
      assert.equal(updater.callbacks[0], callback);
      return assert.equal(updater.callbacks.length, 1);
    });
    it('allow to remove callback', function() {
      var callback, updater;
      updater = new Updater();
      callback = function() {
        return 1;
      };
      assert.equal(updater.callbacks.length, 0);
      updater.addCallback(callback);
      assert.equal(updater.callbacks[0], callback);
      assert.equal(updater.callbacks.length, 1);
      updater.removeCallback(callback);
      return assert.equal(updater.callbacks.length, 0);
    });
    return it('call callback on update', function() {
      var callback, calls, updater;
      updater = new Updater();
      calls = 0;
      callback = function() {
        return calls++;
      };
      updater.addCallback(callback);
      assert.equal(calls, 0);
      updater.update();
      return assert.equal(calls, 1);
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