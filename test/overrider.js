(function() {
  var Mixable, Overrider, assert;

  assert = require('chai').assert;

  Mixable = require('../lib/Mixable');

  Overrider = require('../lib/Overrider');

  describe('Overrider', function() {
    it('can call an overrider function by itself', function() {
      var TestClass, obj;
      TestClass = (function() {
        class TestClass extends Overrider {};

        TestClass.overrides({
          foo: function() {
            return ['hello', this.foo.withoutTestClass()];
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass();
      return assert.deepEqual(obj.foo(), ['hello', void 0]);
    });
    it('can override a function', function() {
      var TestClass, TestClass2, obj;
      TestClass = (function() {
        class TestClass extends Overrider {};

        TestClass.overrides({
          foo: function() {
            return ['hello', this.foo.withoutTestClass()];
          }
        });

        return TestClass;

      }).call(this);
      TestClass2 = class TestClass2 {
        foo() {
          return 'hi';
        }

      };
      TestClass.prototype.extended(TestClass2.prototype);
      obj = new TestClass2();
      return assert.deepEqual(obj.foo(), ['hello', 'hi']);
    });
    it('can override a function with mixable', function() {
      var TestClass, TestClass2, obj;
      TestClass = (function() {
        class TestClass extends Overrider {};

        TestClass.overrides({
          foo: function() {
            return ['hello', this.foo.withoutTestClass()];
          }
        });

        return TestClass;

      }).call(this);
      TestClass2 = (function() {
        class TestClass2 extends Mixable {
          foo() {
            return 'hi';
          }

        };

        TestClass2.extend(TestClass);

        return TestClass2;

      }).call(this);
      obj = new TestClass2();
      return assert.deepEqual(obj.foo(), ['hello', 'hi']);
    });
    it('can override a function twice', function() {
      var Mixin1, Mixin2, TestClass2, obj;
      Mixin1 = (function() {
        class Mixin1 extends Overrider {};

        Mixin1.overrides({
          foo: function() {
            return ['hello', this.foo.withoutMixin1()].join(' ');
          }
        });

        return Mixin1;

      }).call(this);
      Mixin2 = (function() {
        class Mixin2 extends Overrider {};

        Mixin2.overrides({
          foo: function() {
            return ['hey', this.foo.withoutMixin2()].join(' ');
          }
        });

        return Mixin2;

      }).call(this);
      TestClass2 = (function() {
        class TestClass2 extends Mixable {
          foo() {
            return 'hi';
          }

        };

        TestClass2.extend(Mixin1);

        TestClass2.extend(Mixin2);

        return TestClass2;

      }).call(this);
      obj = new TestClass2();
      return assert.equal(obj.foo(), 'hey hello hi');
    });
    it('can use a specific override function', function() {
      var Mixin1, Mixin2, TestClass2, obj;
      Mixin1 = (function() {
        class Mixin1 extends Overrider {};

        Mixin1.overrides({
          foo: function() {
            return 'hello';
          }
        });

        return Mixin1;

      }).call(this);
      Mixin2 = (function() {
        class Mixin2 extends Overrider {};

        Mixin2.overrides({
          foo: function() {
            return 'hey';
          }
        });

        return Mixin2;

      }).call(this);
      TestClass2 = (function() {
        class TestClass2 extends Mixable {
          foo() {
            return 'hi';
          }

        };

        TestClass2.extend(Mixin1);

        TestClass2.extend(Mixin2);

        return TestClass2;

      }).call(this);
      obj = new TestClass2();
      assert.equal(obj.foo(), 'hey');
      assert.equal(obj.foo.withMixin1(), 'hello');
      return assert.equal(obj.foo.withoutMixin1(), 'hi');
    });
    it('does not change the original function', function() {
      var Mixin1, Mixin2, TestClass, alone1, alone2, obj;
      Mixin1 = (function() {
        class Mixin1 extends Overrider {};

        Mixin1.overrides({
          foo: function() {
            return ['hello', this.foo.withoutMixin1()].join(' ');
          }
        });

        return Mixin1;

      }).call(this);
      Mixin2 = (function() {
        class Mixin2 extends Overrider {};

        Mixin2.overrides({
          foo: function() {
            return ['hey', this.foo.withoutMixin2()].join(' ');
          }
        });

        return Mixin2;

      }).call(this);
      TestClass = (function() {
        class TestClass extends Mixable {
          foo() {
            return 'hi';
          }

        };

        TestClass.extend(Mixin1);

        TestClass.extend(Mixin2);

        return TestClass;

      }).call(this);
      obj = new TestClass();
      alone1 = new Mixin1();
      alone2 = new Mixin2();
      assert.equal(obj.foo(), 'hey hello hi');
      assert.equal(alone1.foo(), 'hello ');
      return assert.equal(alone2.foo(), 'hey ');
    });
    return it('can be extended', function() {
      var Mixin1, Mixin2, TestClass, obj;
      Mixin1 = (function() {
        class Mixin1 extends Overrider {};

        Mixin1.overrides({
          foo: function() {
            return ['hello', this.foo.withoutMixin1()].join(' ');
          }
        });

        return Mixin1;

      }).call(this);
      Mixin2 = class Mixin2 extends Mixin1 {};
      TestClass = (function() {
        class TestClass extends Mixable {
          foo() {
            return 'hi';
          }

        };

        TestClass.extend(Mixin2);

        return TestClass;

      }).call(this);
      obj = new TestClass();
      return assert.equal(obj.foo(), 'hello hi');
    });
  });

}).call(this);

//# sourceMappingURL=maps/overrider.js.map
