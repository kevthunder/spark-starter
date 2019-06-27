(function() {
  var Mixable, assert;

  assert = require('chai').assert;

  Mixable = require('../lib/Mixable');

  describe('Mixable', function() {
    it('can get includable attributes', function() {
      var TestClass, TestClass2;
      TestClass = class TestClass extends Mixable {
        foo() {
          return 'hello';
        }

      };
      TestClass2 = class TestClass2 extends Mixable {};
      return assert.deepEqual(Mixable.Extension.getExtensionProperties(TestClass.prototype, TestClass2.prototype).map(function(prop) {
        return prop.name;
      }), ['foo']);
    });
    it('can get prototype chain', function() {
      var TestClass, TestClass2;
      TestClass = class TestClass extends Mixable {};
      TestClass2 = class TestClass2 extends TestClass {};
      return assert.deepEqual(Mixable.Extension.getPrototypeChain(TestClass2), [TestClass2, TestClass, Mixable]);
    });
    it('can include functions from an object', function() {
      var TestClass, obj, toInclude;
      toInclude = {
        foo: 'hello'
      };
      TestClass = (function() {
        class TestClass extends Mixable {};

        TestClass.include(toInclude);

        return TestClass;

      }).call(this);
      obj = new TestClass();
      return assert.equal(obj.foo, 'hello');
    });
    it('can extend a third class', function() {
      var BaseClass, TestClass, obj;
      BaseClass = class BaseClass extends Mixable {
        foo() {
          return 'hello';
        }

        static bar() {
          return 'hey';
        }

      };
      TestClass = (function() {
        class TestClass extends Mixable {};

        TestClass.extend(BaseClass);

        return TestClass;

      }).call(this);
      assert.equal(TestClass.bar(), 'hey');
      obj = new TestClass();
      return assert.equal(obj.foo(), 'hello');
    });
    it('can extend a nested class', function() {
      var BaseClass, SupClass, TestClass, obj;
      BaseClass = (function() {
        class BaseClass extends Mixable {
          foo() {
            return 'hello';
          }

          static bar() {
            return 'hey';
          }

        };

        BaseClass.prototype.baz = 'hi';

        return BaseClass;

      }).call(this);
      SupClass = class SupClass extends BaseClass {};
      TestClass = (function() {
        class TestClass extends Mixable {};

        TestClass.extend(SupClass);

        return TestClass;

      }).call(this);
      assert.equal(TestClass.bar(), 'hey');
      obj = new TestClass();
      assert.equal(obj.foo(), 'hello');
      return assert.equal(obj.baz, 'hi');
    });
    it('can extend a nested class with same property', function() {
      var BaseClass, SupClass, TestClass, obj;
      BaseClass = class BaseClass extends Mixable {
        foo() {
          return 'hello';
        }

      };
      SupClass = class SupClass extends BaseClass {
        foo() {
          return 'hi';
        }

      };
      TestClass = (function() {
        class TestClass extends Mixable {};

        TestClass.extend(SupClass);

        return TestClass;

      }).call(this);
      obj = new TestClass();
      return assert.equal(obj.foo(), 'hi');
    });
    it('can extend properties with accessor', function() {
      var BaseClass, TestClass, obj, val;
      val = 1;
      BaseClass = class BaseClass extends Mixable {};
      Object.defineProperty(BaseClass.prototype, 'foo', {
        get: function() {
          return val;
        }
      });
      TestClass = (function() {
        class TestClass extends Mixable {};

        TestClass.extend(BaseClass);

        return TestClass;

      }).call(this);
      obj = new TestClass();
      assert.equal(obj.foo, 1);
      val = 2;
      return assert.equal(obj.foo, 2);
    });
    return it('should keep Final Properties definition', function() {
      var BaseClass, TestClass, obj;
      BaseClass = class BaseClass extends Mixable {
        getFinalProperties() {
          return ['foo'];
        }

      };
      TestClass = (function() {
        class TestClass extends Mixable {
          getFinalProperties() {
            return ['bar'];
          }

        };

        TestClass.extend(BaseClass);

        return TestClass;

      }).call(this);
      obj = new TestClass();
      return assert.deepEqual(obj.getFinalProperties(), ['foo', 'bar']);
    });
  });

}).call(this);

//# sourceMappingURL=maps/mixable.js.map
