(function() {
  var Element, assert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  assert = require('chai').assert;

  Element = require('../lib/Element');

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
      assert.equal(obj.prop, 7);
      obj.setProp(11);
      return assert.equal(obj.prop, 11);
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
          assert.equal(event, 'propChanged');
          assert.equal(params[0], 1);
          return this.callcount += 1;
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      obj.prop = 7;
      assert.equal(obj.prop, 7);
      return assert.equal(obj.callcount, 1);
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
    it('should emit event when a property is invalidated and is changed', function() {
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

        TestClass.prototype.getListeners = function() {
          return [{}];
        };

        TestClass.prototype.emitEvent = function(event, params) {
          assert.equal(event, 'propChanged');
          assert.equal(params[0], lastValue - 1);
          return this.callcount += 1;
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
          this.callcount = 0;
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
          assert.equal(event, 'propChanged');
          assert.equal(params[0], lastValue - 1);
          return this.callcount += 1;
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.added, 0);
      assert.equal(obj.calculed, 0);
      obj.addListener('propChanged', function() {});
      assert.equal(obj.added, 1, 'listened added');
      assert.equal(obj.calculed, 1, 'calculed');
      assert.equal(obj.callcount, 0);
      emitter.emit();
      return assert.equal(obj.callcount, 1, 'event emmited');
    });
    it('should not emit event when a property is invalidated and is not changed', function() {
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
          assert.equal(event, 'propChanged');
          assert.equal(params[0], lastValue - 1);
          return this.callcount += 1;
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
    it('have a method to unbind all invalidators', function() {
      var TestClass, calls, emitter, obj, res;
      calls = 0;
      emitter = {
        addListener: function(evt, listener) {
          return assert.equal(evt, 'testChanged');
        },
        removeListener: function(evt, listener) {
          assert.equal(evt, 'testChanged');
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
      return assert.equal(calls, 1);
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
    return it('return new Property when calling getProperty after an override', function() {
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
  });

}).call(this);
