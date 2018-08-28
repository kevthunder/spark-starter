(function() {
  var assert;

  assert = require('chai').assert;

  describe('concatened file check', function() {
    describe('lib/spark-starter.js', function() {
      var Spark;
      Spark = null;
      before(function() {
        return Spark = require('../lib/spark-starter.js');
      });
      it('contains Element', function() {
        return assert.isFunction(Spark.Element);
      });
      it('contains Collection', function() {
        return assert.isFunction(Spark.Collection);
      });
      return it('can create working Element', function() {
        var TestClass, obj;
        TestClass = (function() {
          class TestClass extends Spark.Element {};

          TestClass.properties({
            hello: {
              calcul: function() {
                return 'hello';
              }
            }
          });

          return TestClass;

        }).call(this);
        obj = new TestClass();
        return assert.equal(obj.hello, 'hello');
      });
    });
    return describe('dist/spark-starter.min.js', function() {
      var Spark;
      Spark = null;
      before(function() {
        return Spark = require('../dist/spark-starter.min.js');
      });
      it('contains Element', function() {
        return assert.isFunction(Spark.Element);
      });
      it('contains Collection', function() {
        return assert.isFunction(Spark.Collection);
      });
      return it('can create working Element', function() {
        var TestClass, obj;
        TestClass = (function() {
          class TestClass extends Spark.Element {};

          TestClass.properties({
            hello: {
              calcul: function() {
                return 'hello';
              }
            }
          });

          return TestClass;

        }).call(this);
        obj = new TestClass();
        return assert.equal(obj.hello, 'hello');
      });
    });
  });

}).call(this);

//# sourceMappingURL=maps/concat.js.map
