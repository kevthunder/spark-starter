(function() {
  var Element, EventEmitter, Property, assert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  assert = require('chai').assert;

  Element = require('../lib/Element');

  Property = require('../lib/Property');

  EventEmitter = require("wolfy87-eventemitter");

  describe('Element', function() {
    var invalidateEvents, updateEvents;
    invalidateEvents = ['propInvalidated'];
    updateEvents = ['propChanged', 'propUpdated'];
    it('can include functions from an object', function() {
      var TestClass, obj, toInclude;
      toInclude = {
        foo: 'hello'
      };
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          return TestClass.__super__.constructor.apply(this, arguments);
        }

        TestClass.include(toInclude);

        return TestClass;

      })(Element);
      obj = new TestClass();
      return assert.equal(obj.foo, 'hello');
    });
    it('can extend a third class', function() {
      var BaseClass, TestClass, obj;
      BaseClass = (function(superClass) {
        extend(BaseClass, superClass);

        function BaseClass() {
          return BaseClass.__super__.constructor.apply(this, arguments);
        }

        BaseClass.prototype.foo = function() {
          return 'hello';
        };

        BaseClass.bar = function() {
          return 'hey';
        };

        return BaseClass;

      })(Element);
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          return TestClass.__super__.constructor.apply(this, arguments);
        }

        TestClass.extend(BaseClass);

        return TestClass;

      })(Element);
      assert.equal(TestClass.bar(), 'hey');
      obj = new TestClass();
      return assert.equal(obj.foo(), 'hello');
    });
    it('can extend a third class with properties', function() {
      var BaseClass, TestClass, obj;
      BaseClass = (function(superClass) {
        extend(BaseClass, superClass);

        function BaseClass() {
          return BaseClass.__super__.constructor.apply(this, arguments);
        }

        BaseClass.properties({
          foo: {
            "default": 'hello'
          }
        });

        return BaseClass;

      })(Element);
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          return TestClass.__super__.constructor.apply(this, arguments);
        }

        TestClass.extend(BaseClass);

        TestClass.properties({
          bar: {
            "default": 'hey'
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.foo, 'hello');
      assert.equal(obj.bar, 'hey');
      assert.instanceOf(obj.getProperty("foo"), Property);
      return assert.instanceOf(obj.getProperty("bar"), Property);
    });
    it('can extend a third class with merged properties', function() {
      var BaseClass, Test1Class, Test2Class, Test3Class;
      BaseClass = (function(superClass) {
        extend(BaseClass, superClass);

        function BaseClass() {
          return BaseClass.__super__.constructor.apply(this, arguments);
        }

        BaseClass.properties({
          foo: {
            "default": 'hello'
          }
        });

        return BaseClass;

      })(Element);
      Test1Class = (function(superClass) {
        extend(Test1Class, superClass);

        function Test1Class() {
          return Test1Class.__super__.constructor.apply(this, arguments);
        }

        Test1Class.extend(BaseClass);

        Test1Class.properties({
          foo: {
            calcul: function() {
              return 'hey';
            }
          }
        });

        return Test1Class;

      })(Element);
      Test2Class = (function(superClass) {
        extend(Test2Class, superClass);

        function Test2Class() {
          return Test2Class.__super__.constructor.apply(this, arguments);
        }

        Test2Class.extend(BaseClass);

        Test2Class.properties({
          foo: {
            "default": 'hi'
          }
        });

        return Test2Class;

      })(Element);
      Test3Class = (function(superClass) {
        extend(Test3Class, superClass);

        function Test3Class() {
          return Test3Class.__super__.constructor.apply(this, arguments);
        }

        Test3Class.extend(BaseClass);

        return Test3Class;

      })(Test1Class);
      assert.equal((new BaseClass()).foo, 'hello');
      assert.equal((new Test1Class()).foo, 'hey');
      assert.equal((new Test2Class()).foo, 'hi');
      return assert.equal((new Test3Class()).foo, 'hey');
    });
    it('should emit event when value change', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            "default": 1
          }
        });

        TestClass.prototype.emitEvent = function(event, params) {
          assert.include(updateEvents, event);
          assert.equal(params[0], 1);
          return this.callcount += 1;
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      return assert.equal(obj.callcount, updateEvents.length);
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
      obj.propChanged = function(old) {
        assert.equal(this._prop, 11);
        return assert.equal(old, 7);
      };
      return obj.setProp(11);
    });
    it('should calcul a prop only once and on demand', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function() {
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
    it('give access to an invalidator in the calcul option of a property', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function(invalidated) {
              assert.typeOf(invalidated.prop, 'function');
              assert.typeOf(invalidated.value, 'function');
              assert.typeOf(invalidated.event, 'function');
              return this.callcount += 1;
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      obj.getProp();
      return assert.equal(obj.callcount, 1);
    });
    it('should emit changed event when a property is invalidated and is changed', function() {
      var TestClass, lastValue, obj;
      lastValue = 0;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function() {
              return lastValue += 1;
            }
          }
        });

        TestClass.prototype.getListeners = function(event) {
          if (event === 'propChanged') {
            return [{}];
          } else {
            return [];
          }
        };

        TestClass.prototype.emitEvent = function(event, params) {
          if (event === 'propChanged') {
            assert.equal(params[0], lastValue - 1);
            return this.callcount += 1;
          }
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      obj.getProp();
      assert.equal(obj.callcount, 0);
      obj.invalidateProp();
      return assert.equal(obj.callcount, 1);
    });
    it('should not calcul when a property is invalidated with update event', function() {
      var TestClass, lastValue, obj;
      lastValue = 0;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
          this.eventCount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function() {
              return this.callcount += 1;
            }
          }
        });

        TestClass.prototype.getListeners = function(event) {
          if (event === 'propUpdated') {
            return [{}];
          } else {
            return [];
          }
        };

        TestClass.prototype.emitEvent = function(event, params) {
          if (event === 'propInvalidated') {
            return this.eventCount += 1;
          }
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      assert.equal(obj.eventCount, 0);
      obj.getProp();
      assert.equal(obj.callcount, 1);
      assert.equal(obj.eventCount, 0);
      obj.invalidateProp();
      assert.equal(obj.callcount, 1);
      return assert.equal(obj.eventCount, 1);
    });
    it('should not emit change event when a property is invalidated and is not changed', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function() {
              return 5;
            }
          }
        });

        TestClass.prototype.getListeners = function() {
          return [{}];
        };

        TestClass.prototype.emitEvent = function(event, params) {
          if (event === 'propChanged') {
            assert.equal(params[0], lastValue - 1);
            return this.callcount += 1;
          }
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      obj.getProp();
      assert.equal(obj.callcount, 0);
      obj.invalidateProp();
      return assert.equal(obj.callcount, 0);
    });
    it('get ready to emit an event when a property is invalidated by an event', function() {
      var TestClass, emitter, lastValue, obj;
      lastValue = 0;
      emitter = {
        addListener: function(evt, listener) {
          this.event = evt;
          return this.listener = listener;
        },
        removeListener: function(evt, listener) {
          this.event = null;
          return this.listener = null;
        },
        emit: function() {
          if (this.listener != null) {
            return this.listener();
          }
        }
      };
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.changedCount = 0;
          this.updatedCount = 0;
          this.added = 0;
          this.calculed = 0;
        }

        TestClass.prototype.getListeners = function() {
          return [{}];
        };

        TestClass.prototype.addListener = function(evt, listener) {
          return this.added += 1;
        };

        TestClass.properties({
          prop: {
            calcul: function(invalidated) {
              invalidated.event('testChanged', emitter);
              this.calculed += 1;
              return lastValue += 1;
            }
          }
        });

        TestClass.prototype.emitEvent = function(event, params) {
          if (event === 'propChanged') {
            assert.equal(params[0], lastValue - 1);
            this.changedCount += 1;
          }
          if (event === 'propUpdated') {
            return this.updatedCount += 1;
          }
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.added, 0);
      assert.equal(obj.calculed, 0);
      assert.equal(obj.changedCount, 0);
      assert.equal(obj.updatedCount, 0);
      obj.addListener('propChanged', function() {});
      assert.equal(obj.added, 1, 'listened added');
      assert.equal(obj.calculed, 1, 'calculed');
      assert.equal(obj.changedCount, 0);
      assert.equal(obj.updatedCount, 1);
      emitter.emit();
      assert.equal(obj.changedCount, 1, 'event emmited');
      return assert.equal(obj.updatedCount, 2);
    });
    it('have a method to unbind all invalidators', function() {
      var TestClass, calls, emitter, obj, propEvents, res;
      propEvents = ['testInvalidated', 'testUpdated'];
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          return assert.include(propEvents, evt);
        },
        removeListener: function(evt, listener) {
          assert.include(propEvents, evt);
          return calls += 1;
        },
        test: 4
      };
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          prop: {
            calcul: function(invalidated) {
              return invalidated.prop('test', emitter);
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      obj.getProp();
      res = obj.destroyProperties();
      return assert.equal(calls, propEvents.length);
    });
    it('can mass assign properties', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          a: {
            "default": 0
          },
          b: {
            "default": 0
          },
          c: {
            "default": 0
          },
          d: {
            "default": 0
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.a, 0);
      assert.equal(obj.b, 0);
      assert.equal(obj.c, 0);
      assert.equal(obj.d, 0);
      obj.setProperties({
        a: 1,
        b: 2,
        c: 3,
        f: 8
      });
      assert.equal(obj.a, 1);
      assert.equal(obj.b, 2);
      assert.equal(obj.c, 3);
      return assert.equal(obj.d, 0);
    });
    it('can get all manually setted properties', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          a: {
            "default": 0
          },
          b: {
            "default": 0
          },
          c: {
            "default": 0
          },
          d: {
            calcul: function() {
              return 4;
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.deepEqual(obj.getManualDataProperties(), {}, 'initial');
      obj.a = 1;
      obj.b = 2;
      obj.c = 3;
      assert.deepEqual(obj.getManualDataProperties(), {
        a: 1,
        b: 2,
        c: 3
      }, 'after assign');
      obj.invalidateC();
      assert.deepEqual(obj.getManualDataProperties(), {
        a: 1,
        b: 2
      }, 'after invalidate');
      assert.equal(obj.d, 4);
      assert.deepEqual(obj.getManualDataProperties(), {
        a: 1,
        b: 2
      }, 'after cacul');
      obj.d = 5;
      return assert.deepEqual(obj.getManualDataProperties(), {
        a: 1,
        b: 2,
        d: 5
      }, 'after assign over caculated value');
    });
    it('can mass assign properties with whitelist', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          a: {
            "default": 0
          },
          b: {
            "default": 0
          },
          c: {
            "default": 0
          },
          d: {
            "default": 0
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.a, 0);
      assert.equal(obj.b, 0);
      assert.equal(obj.c, 0);
      assert.equal(obj.d, 0);
      obj.setProperties({
        a: 1,
        b: 2,
        c: 3
      }, {
        whitelist: ['a', 'b']
      });
      assert.equal(obj.a, 1);
      assert.equal(obj.b, 2);
      assert.equal(obj.c, 0);
      return assert.equal(obj.d, 0);
    });
    it('can mass assign properties with blacklist', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          a: {
            "default": 0
          },
          b: {
            "default": 0
          },
          c: {
            "default": 0
          },
          d: {
            "default": 0
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.a, 0);
      assert.equal(obj.b, 0);
      assert.equal(obj.c, 0);
      assert.equal(obj.d, 0);
      obj.setProperties({
        a: 1,
        b: 2,
        c: 3
      }, {
        blacklist: ['c']
      });
      assert.equal(obj.a, 1);
      assert.equal(obj.b, 2);
      assert.equal(obj.c, 0);
      return assert.equal(obj.d, 0);
    });
    it('return self when calling tap', function() {
      var TestClass, obj, res;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          return TestClass.__super__.constructor.apply(this, arguments);
        }

        return TestClass;

      })(Element);
      obj = new TestClass();
      res = obj.tap(function() {
        return this.test = 1;
      });
      assert.equal(obj.test, 1);
      return assert.equal(res, obj);
    });
    it('return the same function when calling "callback" twice', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          return TestClass.__super__.constructor.apply(this, arguments);
        }

        TestClass.prototype.doSomething = function() {
          return this.test = 1;
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callback('doSomething'), obj.callback('doSomething'));
      obj.callback('doSomething')();
      return assert.equal(obj.test, 1);
    });
    it('can forward argument with callback', function() {
      var TestClass, calls, obj;
      calls = 0;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          return TestClass.__super__.constructor.apply(this, arguments);
        }

        TestClass.prototype.doSomething = function(arg1, arg2, arg3) {
          assert.equal(arg1, 3);
          assert.equal(arg2, 'test');
          assert.deepEqual(arg3, {
            hi: 5
          });
          return calls += 1;
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      obj.callback('doSomething')(3, 'test', {
        hi: 5
      });
      return assert.equal(calls, 1);
    });
    it('keeps old options when overriding a property', function() {
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
      TestClass.properties({
        prop: {
          "default": 10
        }
      });
      obj = new TestClass();
      assert.equal(obj.prop, 10);
      assert.equal(obj.callcount, 0);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      return assert.equal(obj.callcount, 1);
    });
    it('allows to call an overrided function of a property', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount1 = 0;
          this.callcount2 = 0;
        }

        TestClass.properties({
          prop: {
            change: function(old) {
              return this.callcount1 += 1;
            }
          }
        });

        return TestClass;

      })(Element);
      TestClass.properties({
        prop: {
          change: function(old, overrided) {
            overrided(old);
            return this.callcount2 += 1;
          }
        }
      });
      obj = new TestClass();
      assert.equal(obj.callcount1, 0);
      assert.equal(obj.callcount2, 0);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      assert.equal(obj.callcount1, 1, "original callcount");
      return assert.equal(obj.callcount2, 1, "new callcount");
    });
    it('return new Property when calling getProperty after an override', function() {
      var TestClass, newProp, obj, oldProp;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          return TestClass.__super__.constructor.apply(this, arguments);
        }

        return TestClass;

      })(Element);
      oldProp = TestClass.property("prop", {
        "default": 1
      });
      newProp = TestClass.property("prop", {
        "default": 2
      });
      obj = new TestClass();
      return assert.equal(obj.getProperty("prop"), newProp);
    });
    it('should propagate invalidation', function() {
      var TestClass, lvl1, lvl2, lvl3, res, val;
      val = 1;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        TestClass.include(EventEmitter.prototype);

        function TestClass(source) {
          this.source = source;
          this.calculCount = 0;
        }

        TestClass.properties({
          source: {},
          forwarded: {
            calcul: function(invalidator) {
              this.calculCount++;
              if (invalidator.prop('source') != null) {
                return invalidator.prop('forwarded', this.source);
              } else {
                return val;
              }
            }
          }
        });

        return TestClass;

      })(Element);
      lvl1 = new TestClass();
      lvl2 = new TestClass(lvl1);
      lvl3 = new TestClass(lvl2);
      assert.equal(lvl1.calculCount, 0, "lvl1 calculCount beginning");
      assert.equal(lvl2.calculCount, 0, "lvl2 calculCount beginning");
      assert.equal(lvl3.calculCount, 0, "lvl3 calculCount beginning");
      res = lvl3.getForwarded();
      assert.equal(res, 1, "result for get");
      assert.equal(lvl1.calculCount, 1, "lvl1 calculCount after get");
      assert.equal(lvl2.calculCount, 1, "lvl2 calculCount after get");
      assert.equal(lvl3.calculCount, 1, "lvl3 calculCount after get");
      val += 1;
      lvl1.invalidateForwarded();
      assert.equal(lvl1.calculCount, 1, "lvl1 calculCount after invalidate");
      assert.equal(lvl2.calculCount, 1, "lvl2 calculCount after invalidate");
      assert.equal(lvl3.calculCount, 1, "lvl3 calculCount after invalidate");
      res = lvl3.getForwarded();
      assert.equal(res, 2, "result for get 2");
      assert.equal(lvl1.calculCount, 2, "lvl1 calculCount after get 2");
      assert.equal(lvl2.calculCount, 2, "lvl2 calculCount after get 2");
      return assert.equal(lvl3.calculCount, 2, "lvl3 calculCount after get 2");
    });
    return it('should not recalculate if no change while propagating', function() {
      var TestClass, lvl1, lvl2, lvl3, res, val;
      val = 1;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        TestClass.include(EventEmitter.prototype);

        function TestClass(source) {
          this.source = source;
          this.calculCount = 0;
        }

        TestClass.properties({
          source: {},
          forwarded: {
            calcul: function(invalidator) {
              this.calculCount++;
              if (invalidator.prop('source') != null) {
                return invalidator.prop('forwarded', this.source);
              } else {
                return val;
              }
            }
          }
        });

        return TestClass;

      })(Element);
      lvl1 = new TestClass();
      lvl2 = new TestClass(lvl1);
      lvl3 = new TestClass(lvl2);
      assert.equal(lvl1.calculCount, 0, "lvl1 calculCount beginning");
      assert.equal(lvl2.calculCount, 0, "lvl2 calculCount beginning");
      assert.equal(lvl3.calculCount, 0, "lvl3 calculCount beginning");
      res = lvl3.getForwarded();
      assert.equal(res, 1, "result for get");
      assert.equal(lvl1.calculCount, 1, "lvl1 calculCount after get");
      assert.equal(lvl2.calculCount, 1, "lvl2 calculCount after get");
      assert.equal(lvl3.calculCount, 1, "lvl3 calculCount after get");
      lvl1.invalidateForwarded();
      assert.equal(lvl1.calculCount, 1, "lvl1 calculCount after invalidate");
      assert.equal(lvl2.calculCount, 1, "lvl2 calculCount after invalidate");
      assert.equal(lvl3.calculCount, 1, "lvl3 calculCount after invalidate");
      lvl3.getForwarded();
      assert.equal(res, 1, "result for get 2");
      assert.equal(lvl1.calculCount, 2, "lvl1 calculCount after get 2");
      assert.equal(lvl2.calculCount, 1, "lvl2 calculCount after get 2");
      return assert.equal(lvl3.calculCount, 1, "lvl3 calculCount after get 2");
    });
  });

}).call(this);
