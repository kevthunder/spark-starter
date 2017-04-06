(function() {
  var Element, assert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  assert = require('chai').assert;

  Element = require('../dist/spark-starter');

  describe('Element', function() {
    it('should get property', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          prop: {
            "default": 7
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.prop, 7);
      return assert.equal(obj.getProp(), 7);
    });
    it('should set property', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          prop: {}
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      obj.prop = 7;
      assert.equal(obj._prop, 7);
      obj.setProp(11);
      return assert.equal(obj._prop, 11);
    });
    it('should return self while using set function', function() {
      var TestClass, obj, res;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          prop: {}
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      res = obj.setProp(11);
      assert.equal(obj.prop, 11);
      return assert.equal(res, obj);
    });
    it('should call change only when value differ', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            change: function() {
              return this.callcount += 1;
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      assert.equal(obj.callcount, 1);
      obj.setProp(11);
      assert.equal(obj.prop, 11);
      assert.equal(obj.callcount, 2);
      obj.setProp(11);
      assert.equal(obj.prop, 11);
      return assert.equal(obj.callcount, 2);
    });
    it('allow access to old and new value in change function', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          prop: {
            "default": 7
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      obj.changeProp = function(old) {
        assert.equal(this._prop, 11);
        return assert.equal(old, 7);
      };
      return obj.setProp(11);
    });
    return it('should init a prop only once and on demand', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            init: function() {
              return this.callcount += 1;
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      obj.getProp();
      assert.equal(obj.callcount, 1);
      obj.getProp();
      return assert.equal(obj.callcount, 1);
    });
  });

}).call(this);
