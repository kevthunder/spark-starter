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
      return assert.deepEqual(Mixable.Extension.getExtensionProperties(TestClass.prototype, TestClass2.prototype), ['foo']);
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
    return it('can extend a nested class', function() {
      var BaseClass, SupClass, TestClass, obj;
      BaseClass = class BaseClass extends Mixable {
        foo() {
          return 'hello';
        }

        static bar() {
          return 'hey';
        }

      };
      SupClass = class SupClass extends BaseClass {};
      TestClass = (function() {
        class TestClass extends Mixable {};

        TestClass.extend(SupClass);

        return TestClass;

      }).call(this);
      assert.equal(TestClass.bar(), 'hey');
      obj = new TestClass();
      return assert.equal(obj.foo(), 'hello');
    });
  });

}).call(this);

//# sourceMappingURL=maps/mixable.js.map
