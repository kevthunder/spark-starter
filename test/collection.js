(function() {
  var Collection, assert;

  assert = require('chai').assert;

  Collection = require('../lib/Collection');

  describe('Collection', function() {
    it('can count items', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      return assert.equal(coll.count(), 3);
    });
    it('can get item', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      return assert.equal(coll.get(1), 2);
    });
    it('can set item', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      assert.equal(coll.get(1), 2);
      coll.set(1, 4);
      return assert.equal(coll.get(1), 4);
    });
    it('can push item', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      assert.equal(coll.count(), 3, 'old Count');
      coll.push(4);
      assert.equal(coll.count(), 4, 'new Count');
      return assert.equal(coll.get(3), 4, 'new val');
    });
    it('can convert to array', function() {
      var arr, coll;
      coll = new Collection([1, 2, 3]);
      arr = coll.toArray();
      assert.isTrue(arr instanceof Array);
      return assert.equal(arr.toString(), '1,2,3');
    });
    it('has string representation', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      return assert.equal(coll.toString(), '1,2,3');
    });
    it('can remove an item', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      assert.equal(coll.count(), 3, 'old Count');
      coll.remove(2);
      assert.equal(coll.count(), 2, 'new Count');
      return assert.equal(coll.toString(), '1,3');
    });
    it('should trigger changed when seting item', function() {
      var calls, coll;
      calls = 0;
      coll = new Collection([1, 2, 3]);
      coll.changed = function() {
        return calls++;
      };
      assert.equal(calls, 0);
      assert.equal(coll.get(1), 2);
      coll.set(1, 4);
      assert.equal(coll.get(1), 4);
      return assert.equal(calls, 1);
    });
    it('should not trigger changed when seting item to same value', function() {
      var calls, coll;
      calls = 0;
      coll = new Collection([1, 2, 3]);
      coll.changed = function() {
        return calls++;
      };
      assert.equal(calls, 0);
      assert.equal(coll.get(1), 2);
      coll.set(1, 2);
      assert.equal(coll.get(1), 2);
      return assert.equal(calls, 0);
    });
    it('should trigger changed when removing item', function() {
      var calls, coll;
      calls = 0;
      coll = new Collection([1, 2, 3]);
      coll.changed = function() {
        return calls++;
      };
      assert.equal(calls, 0);
      assert.equal(coll.count(), 3, 'old Count');
      coll.remove(2);
      assert.equal(coll.count(), 2, 'new Count');
      assert.equal(coll.toString(), '1,3');
      return assert.equal(calls, 1);
    });
    it('should not trigger changed when tying to removing inexistant item', function() {
      var calls, coll;
      calls = 0;
      coll = new Collection([1, 2, 3]);
      coll.changed = function() {
        return calls++;
      };
      assert.equal(calls, 0);
      assert.equal(coll.count(), 3, 'old Count');
      coll.remove(7);
      assert.equal(coll.count(), 3, 'new Count');
      assert.equal(coll.toString(), '1,2,3');
      return assert.equal(calls, 0);
    });
    return it('should trigger changed when pushing an item', function() {
      var calls, coll;
      calls = 0;
      coll = new Collection([1, 2, 3]);
      coll.changed = function() {
        return calls++;
      };
      assert.equal(calls, 0);
      assert.equal(coll.count(), 3, 'old Count');
      coll.push(4);
      assert.equal(coll.count(), 4, 'new Count');
      assert.equal(coll.get(3), 4, 'new val');
      return assert.equal(calls, 1);
    });
  });

}).call(this);
