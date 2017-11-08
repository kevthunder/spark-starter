(function() {
  var assert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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
        TestClass = (function(superClass) {
          extend(TestClass, superClass);

          function TestClass() {
            return TestClass.__super__.constructor.apply(this, arguments);
          }

          TestClass.properties({
            hello: {
              calcul: function() {
                return 'hello';
              }
            }
          });

          return TestClass;

        })(Spark.Element);
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
        TestClass = (function(superClass) {
          extend(TestClass, superClass);

          function TestClass() {
            return TestClass.__super__.constructor.apply(this, arguments);
          }

          TestClass.properties({
            hello: {
              calcul: function() {
                return 'hello';
              }
            }
          });

          return TestClass;

        })(Spark.Element);
        obj = new TestClass();
        return assert.equal(obj.hello, 'hello');
      });
    });
  });

}).call(this);
