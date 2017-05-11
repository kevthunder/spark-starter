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
          assert.equal(event, 'changedProp');
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
      obj.changeProp = function(old) {
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
    it('should be able to invalidate a property', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          prop: {
            calcul: function() {
              return 3;
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj._prop, void 0);
      assert.equal(obj.propCalculated, false);
      obj.getProp();
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, true);
      obj.invalidateProp();
      assert.equal(obj._prop, 3);
      return assert.equal(obj.propCalculated, false);
    });
    it('should be able to invalidate a property from an event', function() {
      var TestClass, emitter, obj;
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

        function TestClass() {}

        TestClass.properties({
          prop: {
            calcul: function(invalidator) {
              invalidator.fromEvent('changedTest', emitter);
              return 3;
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj._prop, void 0);
      assert.equal(obj.propCalculated, false);
      obj.getProp();
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, true);
      emitter.emit();
      assert.equal(obj._prop, 3);
      return assert.equal(obj.propCalculated, false);
    });
    it('should re-calcul only on the next get after an avalidation', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function() {
              this.callcount += 1;
              return 3;
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      assert.equal(obj._prop, void 0);
      assert.equal(obj.propCalculated, false);
      obj.getProp();
      assert.equal(obj.callcount, 1);
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, true);
      obj.invalidateProp();
      assert.equal(obj.callcount, 1);
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, false);
      obj.getProp();
      assert.equal(obj.callcount, 2);
      assert.equal(obj._prop, 3);
      return assert.equal(obj.propCalculated, true);
    });
    it('should re-calcul immediately when the option is true', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function() {
              this.callcount += 1;
              return 3;
            },
            immediate: true
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      assert.equal(obj._prop, void 0);
      assert.equal(obj.propCalculated, false);
      obj.getProp();
      assert.equal(obj.callcount, 1);
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, true);
      obj.invalidateProp();
      assert.equal(obj.callcount, 2);
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, true);
      obj.getProp();
      assert.equal(obj.callcount, 2);
      assert.equal(obj._prop, 3);
      return assert.equal(obj.propCalculated, true);
    });
    it('should re-calcul immediately if there is a listener on the change event', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {
          this.callcount = 0;
        }

        TestClass.properties({
          prop: {
            calcul: function() {
              this.callcount += 1;
              return 3;
            }
          }
        });

        TestClass.prototype.getListeners = function() {
          return [{}];
        };

        return TestClass;

      })(Element);
      obj = new TestClass();
      assert.equal(obj.callcount, 0);
      assert.equal(obj._prop, void 0);
      assert.equal(obj.propCalculated, false);
      obj.getProp();
      assert.equal(obj.callcount, 1);
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, true);
      obj.invalidateProp();
      assert.equal(obj.callcount, 2);
      assert.equal(obj._prop, 3);
      assert.equal(obj.propCalculated, true);
      obj.getProp();
      assert.equal(obj.callcount, 2);
      assert.equal(obj._prop, 3);
      return assert.equal(obj.propCalculated, true);
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
          assert.equal(event, 'changedProp');
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
          assert.equal(event, 'changedProp');
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
    it('should allow to alter the input value', function() {
      var TestClass, obj;
      TestClass = (function(superClass) {
        extend(TestClass, superClass);

        function TestClass() {}

        TestClass.properties({
          prop: {
            ingest: function(val) {
              if (val === 2) {
                return 'two';
              } else {
                return val;
              }
            }
          }
        });

        return TestClass;

      })(Element);
      obj = new TestClass();
      obj.prop = 2;
      assert.equal(obj._prop, 'two');
      obj.prop = 'zero';
      return assert.equal(obj._prop, 'zero');
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
    return it('return the same function when calling "callback" twice', function() {
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
  });

}).call(this);
