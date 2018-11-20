(function() {
  var EventEmitter, Invalidator, Property, Updater, assert;

  assert = require('chai').assert;

  Property = require('../lib/Property');

  Invalidator = require('../lib/Invalidator');

  EventEmitter = require('../lib/EventEmitter');

  Updater = require('../lib/Updater');

  describe('Updated Property', function() {
    it('should not not be immediate', function() {
      var emitter, updater;
      updater = new Updater();
      emitter = new EventEmitter();
      (new Property('bar', {
        updater: updater,
        change: function() {}
      })).bind(emitter);
      emitter.bar;
      return assert.isFalse(emitter._bar.isImmediate());
    });
    return it('triggers change only after an update', function() {
      var changeCalls, emitter, res, updater;
      updater = new Updater();
      emitter = new EventEmitter();
      changeCalls = 0;
      (new Property('bar', {
        updater: updater,
        change: function() {
          return changeCalls += 1;
        }
      })).bind(emitter);
      assert.equal(changeCalls, 0, 'changeCalls initial');
      assert.equal(updater.callbacks.length, 0, "nb updater callback, initial");
      emitter.bar = 'hello';
      assert.equal(changeCalls, 0, 'changeCalls after set');
      assert.equal(updater.callbacks.length, 1, "nb updater callback, after set");
      updater.update();
      assert.equal(changeCalls, 1, 'changeCalls after update');
      assert.equal(updater.callbacks.length, 0, "nb updater callback, after update");
      res = emitter.bar;
      assert.equal(res, 'hello');
      assert.equal(changeCalls, 1, 'changeCalls after get 2');
      assert.equal(updater.callbacks.length, 0, "nb updater callback, after get 2");
      emitter.bar = 'hey';
      assert.equal(changeCalls, 1, 'changeCalls after set 2');
      assert.equal(updater.callbacks.length, 1, "nb updater callback, after set 2");
      updater.update();
      assert.equal(changeCalls, 2, 'changeCalls after update 2');
      return assert.equal(updater.callbacks.length, 0, "nb updater callback, after update 2");
    });
  });

}).call(this);

//# sourceMappingURL=maps/updated_property.js.map
