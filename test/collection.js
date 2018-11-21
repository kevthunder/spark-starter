(function() {
  var Collection, assert;

  assert = require('chai').assert;

  Collection = require('../lib/Collection');

  describe('Collection', function() {
    it('can count items', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      assert.equal(coll.count(), 3);
      return assert.equal(coll.length, 3);
    });
    it('can get item', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      return assert.equal(coll.get(1), 2);
    });
    it('can be iterated', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      return assert.equal(JSON.stringify([...coll]), '[1,2,3]');
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
    it('can get randomitem', function() {
      var coll, i, res, val2;
      coll = new Collection([1, 2, 3]);
      res = coll.getRandom();
      assert.isTrue(coll.includes(res));
      i = 0;
      val2 = coll.getRandom();
      while (res === val2) {
        val2 = coll.getRandom();
        i++;
        if (i > 1000) {
          break;
        }
      }
      return assert.notEqual(res, val2);
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
    it('can pluck an item', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      assert.equal(coll.count(), 3, 'old Count');
      coll.pluck(function(item) {
        return item === 2;
      });
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
    it('should trigger changed when pushing an item', function() {
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
    it('can detect changes', function() {
      var coll, compareFunction;
      coll = new Collection([1, 2, 3]);
      assert.isFalse(coll.checkChanges([1, 2, 3]));
      assert.isTrue(coll.checkChanges(["1", "2", "3"]));
      assert.isTrue(coll.checkChanges([1, 2, 4]));
      assert.isTrue(coll.checkChanges([1, 2]));
      assert.isTrue(coll.checkChanges([1, 3, 2]));
      assert.isFalse(coll.checkChanges([1, 3, 2], false));
      assert.isTrue(coll.checkChanges(["1", "2", "3"], false));
      assert.isTrue(coll.checkChanges([1, 2, 4], false));
      assert.isTrue(coll.checkChanges([1, 2], false));
      compareFunction = function(a, b) {
        return a.toString() === b.toString();
      };
      assert.isFalse(coll.checkChanges([1, 2, 3], true, compareFunction));
      assert.isFalse(coll.checkChanges(["1", "2", "3"], true, compareFunction));
      assert.isFalse(coll.checkChanges(["1", "3", "2"], false, compareFunction));
      assert.isTrue(coll.checkChanges(["4", "2", "3"], true, compareFunction));
      return assert.isTrue(coll.checkChanges([1, 3], true, compareFunction));
    });
    it('can tell what items were added compared to another array', function() {
      var newColl, old;
      old = [1, 2, 3];
      newColl = new Collection([1, 4, 2, 3, 5]);
      return assert.equal(newColl.getAddedFrom(old).toString(), '4,5');
    });
    it('can tell what items were removed compared to another array', function() {
      var newColl, old;
      old = [1, 2, 3];
      newColl = new Collection([1]);
      return assert.equal(newColl.getRemovedFrom(old).toString(), '2,3');
    });
    it('can add an item once', function() {
      var coll;
      coll = new Collection([1, 2, 3]);
      coll.add(4);
      assert.equal(coll.toString(), '1,2,3,4');
      coll.add(4);
      return assert.equal(coll.toString(), '1,2,3,4');
    });
    it('can copy itself to a new independant collection ', function() {
      var coll, coll2;
      coll = new Collection([1, 2, 3, 4]);
      assert.equal(coll.toString(), '1,2,3,4');
      coll2 = coll.copy();
      assert.equal(coll2.toString(), '1,2,3,4');
      coll2.pop();
      assert.equal(coll2.toString(), '1,2,3');
      return assert.equal(coll.toString(), '1,2,3,4');
    });
    return it('returns a collection when calling filter and forward added functions', function() {
      var coll, res;
      coll = Collection.newSubClass({
        test: function() {
          return 'test';
        }
      }, [1, 2, 3, 4]);
      res = coll.filter(function(item) {
        return item % 2 === 1;
      });
      assert.equal(res.toString(), '1,3');
      assert.instanceOf(res, Collection);
      return assert.equal(res.test(), 'test');
    });
  });

}).call(this);

//# sourceMappingURL=maps/collection.js.map
