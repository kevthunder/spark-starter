(function() {
  var Element, EventEmitter, Property, assert;

  assert = require('chai').assert;

  Element = require('../lib/Element');

  Property = require('spark-properties').Property;

  EventEmitter = require('events').EventEmitter;

  describe('Element', function() {
    var invalidateEvents, updateEvents;
    invalidateEvents = ['propInvalidated'];
    updateEvents = ['propChanged', 'propUpdated'];
    it('can set properties from the constructor', function() {
      var TestClass, obj;
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.properties({
          foo: {
            default: null
          },
          bar: {
            default: null
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass({
        foo: 'hi',
        bar: 'hello'
      });
      assert.equal(obj.foo, 'hi');
      return assert.equal(obj.bar, 'hello');
    });
    it('can get and set properties', function() {
      var TestClass, obj;
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.properties({
          a: {
            default: null
          },
          b: {
            default: null
          },
          c: {
            default: null
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass();
      obj.a = 1;
      obj.bProperty.set(2);
      obj.propertiesManager.getProperty("c").set(3);
      assert.equal(obj.a, 1);
      assert.equal(obj.bProperty.get(), 2);
      return assert.equal(obj.propertiesManager.getProperty("c").get(), 3);
    });
    it('can extend a third class with properties', function() {
      var BaseClass, TestClass, obj;
      BaseClass = (function() {
        class BaseClass extends Element {};

        BaseClass.properties({
          foo: {
            default: 'hello'
          }
        });

        return BaseClass;

      }).call(this);
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.extend(BaseClass);

        TestClass.properties({
          bar: {
            default: 'hey'
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass();
      assert.equal(obj.foo, 'hello');
      assert.equal(obj.bar, 'hey');
      assert.instanceOf(obj.fooProperty, Property);
      return assert.instanceOf(obj.barProperty, Property);
    });
    it('can extend a third class with properties that have watchers', function() {
      var BaseClass, MiddleClass, TestClass, obj;
      BaseClass = (function() {
        class BaseClass extends Element {};

        BaseClass.properties({
          foo: {
            default: 'hello',
            change: function() {}
          }
        });

        return BaseClass;

      }).call(this);
      MiddleClass = (function() {
        class MiddleClass extends Element {};

        MiddleClass.properties({
          baz: {
            default: 'hi',
            change: function() {}
          }
        });

        return MiddleClass;

      }).call(this);
      TestClass = (function() {
        class TestClass extends BaseClass {};

        TestClass.extend(MiddleClass);

        TestClass.properties({
          bar: {
            default: 'hey',
            change: function() {}
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass();
      assert.equal(obj.foo, 'hello');
      assert.equal(obj.baz, 'hi');
      assert.equal(obj.bar, 'hey');
      assert.instanceOf(obj.fooProperty, Property);
      assert.instanceOf(obj.barProperty, Property);
      return assert.instanceOf(obj.bazProperty, Property);
    });
    it('can extend a nested class with properties', function() {
      var BaseClass, SupClass, TestClass, obj;
      BaseClass = (function() {
        class BaseClass extends Element {};

        BaseClass.properties({
          foo: {
            default: 'hello'
          }
        });

        return BaseClass;

      }).call(this);
      SupClass = class SupClass extends BaseClass {};
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.extend(SupClass);

        TestClass.properties({
          bar: {
            default: 'hey'
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass();
      assert.equal(obj.foo, 'hello');
      assert.equal(obj.bar, 'hey');
      assert.instanceOf(obj.fooProperty, Property);
      return assert.instanceOf(obj.barProperty, Property);
    });
    it('can extend a third class with merged properties', function() {
      var BaseClass, Test1Class, Test2Class, Test3Class;
      BaseClass = (function() {
        class BaseClass extends Element {
          constructor() {
            super();
            this.bar = 'bye';
          }

        };

        BaseClass.properties({
          foo: {
            default: 'hello'
          },
          bar: {
            default: 'adios'
          }
        });

        return BaseClass;

      }).call(this);
      Test1Class = (function() {
        class Test1Class extends Element {
          constructor() {
            super();
            this.bar = 'see you';
          }

        };

        Test1Class.extend(BaseClass);

        Test1Class.properties({
          foo: {
            calcul: function() {
              return 'hey';
            }
          }
        });

        return Test1Class;

      }).call(this);
      Test2Class = (function() {
        class Test2Class extends Element {};

        Test2Class.extend(BaseClass);

        Test2Class.properties({
          foo: {
            default: 'hi'
          }
        });

        return Test2Class;

      }).call(this);
      Test3Class = (function() {
        class Test3Class extends Test1Class {};

        Test3Class.extend(BaseClass);

        return Test3Class;

      }).call(this);
      assert.equal((new BaseClass()).foo, 'hello');
      assert.equal((new Test1Class()).foo, 'hey');
      assert.equal((new Test2Class()).foo, 'hi');
      assert.equal((new Test3Class()).foo, 'hey');
      assert.equal((new BaseClass()).bar, 'bye');
      assert.equal((new Test1Class()).bar, 'see you');
      assert.equal((new Test2Class()).bar, 'adios');
      return assert.equal((new Test3Class()).bar, 'see you');
    });
    it('should calcul a prop only once and on demand', function() {
      var TestClass, obj;
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.prototype.callcount = 0;

        TestClass.properties({
          test: {
            calcul: function() {
              return this.callcount += 1;
            }
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      obj.testProperty.get();
      assert.equal(obj.callcount, 1);
      obj.testProperty.get();
      return assert.equal(obj.callcount, 1);
    });
    it('when destroyed, unbind all invalidators', function() {
      var TestClass, emitter, obj, res;
      emitter = new EventEmitter();
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.properties({
          prop1: {
            calcul: function(invalidated) {
              return invalidated.event('test', emitter);
            }
          },
          prop2: {
            calcul: function(invalidated) {
              return invalidated.event('test', emitter);
            }
          }
        });

        return TestClass;

      }).call(this);
      obj = new TestClass();
      obj.prop1;
      assert.equal(emitter.listenerCount('test'), 1);
      obj.prop2;
      assert.equal(emitter.listenerCount('test'), 2);
      res = obj.destroy();
      return assert.equal(emitter.listenerCount('test'), 0);
    });
    it('return self when calling tap', function() {
      var TestClass, obj, res;
      TestClass = class TestClass extends Element {};
      obj = new TestClass();
      res = obj.tap(function() {
        return this.test = 1;
      });
      assert.equal(obj.test, 1);
      return assert.equal(res, obj);
    });
    it('return the same function when calling "callback" twice', function() {
      var TestClass, obj;
      TestClass = class TestClass extends Element {
        doSomething() {
          return this.test = 1;
        }

      };
      obj = new TestClass();
      assert.equal(obj.callback('doSomething'), obj.callback('doSomething'));
      obj.callback('doSomething')();
      return assert.equal(obj.test, 1);
    });
    it('can forward argument with callback', function() {
      var TestClass, calls, obj;
      calls = 0;
      TestClass = class TestClass extends Element {
        doSomething(arg1, arg2, arg3) {
          assert.equal(arg1, 3);
          assert.equal(arg2, 'test');
          assert.deepEqual(arg3, {
            hi: 5
          });
          return calls += 1;
        }

      };
      obj = new TestClass();
      obj.callback('doSomething')(3, 'test', {
        hi: 5
      });
      return assert.equal(calls, 1);
    });
    it('keeps old options when overriding a property', function() {
      var TestClass, obj;
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.prototype.callcount = 0;

        TestClass.properties({
          prop: {
            change: function() {
              assert.equal(this.constructor, TestClass);
              return this.callcount += 1;
            }
          }
        });

        return TestClass;

      }).call(this);
      TestClass.properties({
        prop: {
          default: 10
        }
      });
      obj = new TestClass();
      assert.equal(obj.callcount, 1);
      assert.equal(obj.prop, 10);
      assert.equal(obj.callcount, 1);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      return assert.equal(obj.callcount, 2);
    });
    return it('allows to call an overrided function of a property', function() {
      var TestClass, obj;
      TestClass = (function() {
        class TestClass extends Element {};

        TestClass.prototype.callcount1 = 0;

        TestClass.prototype.callcount2 = 0;

        TestClass.properties({
          prop: {
            change: function(val, old) {
              return this.callcount1 += 1;
            }
          }
        });

        return TestClass;

      }).call(this);
      TestClass.properties({
        prop: {
          change: function(val, old, overrided) {
            overrided(val, old);
            return this.callcount2 += 1;
          }
        }
      });
      obj = new TestClass();
      assert.equal(obj.callcount1, 1);
      assert.equal(obj.callcount2, 1);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      assert.equal(obj.callcount1, 2, "original callcount");
      return assert.equal(obj.callcount2, 2, "new callcount");
    });
  });

}).call(this);

//# sourceMappingURL=maps/element.js.map
