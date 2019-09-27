(function() {
  var assert;

  assert = require('chai').assert;

  describe('concatened file check', function() {
    var tests;
    tests = (source) => {
      var Spark;
      Spark = null;
      before(function() {
        return Spark = require(source);
      });
      it('contains Element', function() {
        return assert.isFunction(Spark.Element);
      });
      it('contains Collection', function() {
        return assert.isFunction(Spark.Collection);
      });
      it('contains Property', function() {
        return assert.isFunction(Spark.Property);
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
    };
    describe('lib/spark-starter.js', function() {
      return tests('../lib/spark-starter.js');
    });
    return describe('dist/spark-starter.min.js', function() {
      return tests('../dist/spark-starter.min.js');
    });
  });

}).call(this);

//# sourceMappingURL=maps/concat.js.map
