(function() {
  var Spark,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Spark = typeof module !== "undefined" && module !== null ? module.exports = {} : (this.Spark == null ? this.Spark = {} : void 0, this.Spark);

  (function(definition) {
    Spark.Collection = definition();
    return Spark.Collection.definition = definition;
  })(function() {
    var Collection;
    Collection = (function() {
      function Collection(arr) {
        if (arr != null) {
          if (typeof arr.toArray === 'function') {
            this._array = arr.toArray();
          } else if (Array.isArray(arr)) {
            this._array = arr;
          } else {
            this._array = [arr];
          }
        } else {
          this._array = [];
        }
      }

      Collection.prototype.changed = function() {};

      Collection.prototype.get = function(i) {
        return this._array[i];
      };

      Collection.prototype.set = function(i, val) {
        var old;
        if (this._array[i] !== val) {
          old = this.toArray();
          this._array[i] = val;
          this.changed(old);
        }
        return val;
      };

      Collection.prototype.add = function(val) {
        if (!this._array.includes(val)) {
          return this.push(val);
        }
      };

      Collection.prototype.remove = function(val) {
        var index, old;
        index = this._array.indexOf(val);
        if (index !== -1) {
          old = this.toArray();
          this._array.splice(index, 1);
          return this.changed(old);
        }
      };

      Collection.prototype.toArray = function() {
        return this._array.slice();
      };

      Collection.prototype.count = function() {
        return this._array.length;
      };

      Collection.readFunctions = ['every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some', 'toString'];

      Collection.readListFunctions = ['concat', 'filter', 'slice'];

      Collection.writefunctions = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

      Collection.readFunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function() {
          var arg, ref;
          arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return (ref = this._array)[funct].apply(ref, arg);
        };
      });

      Collection.readListFunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function() {
          var arg, ref;
          arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return this.copy((ref = this._array)[funct].apply(ref, arg));
        };
      });

      Collection.writefunctions.forEach(function(funct) {
        return Collection.prototype[funct] = function() {
          var arg, old, ref, res;
          arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          old = this.toArray();
          res = (ref = this._array)[funct].apply(ref, arg);
          this.changed(old);
          return res;
        };
      });

      Collection.newSubClass = function(fn, arr) {
        var SubClass;
        if (typeof fn === 'object') {
          SubClass = (function(superClass) {
            extend(_Class, superClass);

            function _Class() {
              return _Class.__super__.constructor.apply(this, arguments);
            }

            return _Class;

          })(this);
          Object.assign(SubClass.prototype, fn);
          return new SubClass(arr);
        } else {
          return new this(arr);
        }
      };

      Collection.prototype.copy = function(arr) {
        var coll;
        if (arr == null) {
          arr = this.toArray();
        }
        coll = new this.constructor(arr);
        return coll;
      };

      Collection.prototype.equals = function(arr) {
        return (this.count() === (tyepeof(arr.count === 'function') ? arr.count() : arr.length)) && this.every(function(val, i) {
          return arr[i] === val;
        });
      };

      Collection.prototype.getAddedFrom = function(arr) {
        return this._array.filter(function(item) {
          return !arr.includes(item);
        });
      };

      Collection.prototype.getRemovedFrom = function(arr) {
        return arr.filter((function(_this) {
          return function(item) {
            return !_this.includes(item);
          };
        })(this));
      };

      return Collection;

    })();
    return Collection;
  });

  (function(definition) {
    Spark.EventBind = definition();
    return Spark.EventBind.definition = definition;
  })(function() {
    var EventBind;
    EventBind = (function() {
      function EventBind(event1, target1, callback1) {
        this.event = event1;
        this.target = target1;
        this.callback = callback1;
        this.binded = false;
      }

      EventBind.prototype.bind = function() {
        if (!this.binded) {
          if (typeof this.target.addEventListener === 'function') {
            this.target.addEventListener(this.event, this.callback);
          } else if (typeof this.target.addListener === 'function') {
            this.target.addListener(this.event, this.callback);
          } else if (typeof this.target.on === 'function') {
            this.target.on(this.event, this.callback);
          } else {
            throw new Error('No function to add event listeners was found');
          }
        }
        return this.binded = true;
      };

      EventBind.prototype.unbind = function() {
        if (this.binded) {
          if (typeof this.target.removeEventListener === 'function') {
            this.target.removeEventListener(this.event, this.callback);
          } else if (typeof this.target.removeListener === 'function') {
            this.target.removeListener(this.event, this.callback);
          } else if (typeof this.target.off === 'function') {
            this.target.off(this.event, this.callback);
          } else {
            throw new Error('No function to remove event listeners was found');
          }
        }
        return this.binded = false;
      };

      EventBind.prototype.equals = function(eventBind) {
        return eventBind.event === this.event && eventBind.target === this.target && eventBind.callback === this.callback;
      };

      EventBind.prototype.match = function(event, target) {
        return event === this.event && target === this.target;
      };

      return EventBind;

    })();
    return EventBind;
  });

  (function(definition) {
    Spark.Invalidator = definition();
    return Spark.Invalidator.definition = definition;
  })(function(dependencies) {
    var EventBind, Invalidator, pluck;
    if (dependencies == null) {
      dependencies = {};
    }
    EventBind = dependencies.hasOwnProperty("EventBind") ? dependencies.EventBind : Spark.EventBind;
    pluck = function(arr, fn) {
      var found, index;
      index = arr.findIndex(fn);
      if (index > -1) {
        found = arr[index];
        arr.splice(index, 1);
        return found;
      } else {
        return null;
      }
    };
    Invalidator = (function() {
      function Invalidator(property1, obj1) {
        this.property = property1;
        this.obj = obj1 != null ? obj1 : null;
        this.invalidationEvents = [];
        this.recycled = [];
        this.unknowns = [];
        this.invalidateCallback = (function(_this) {
          return function() {
            _this.invalidate();
            return null;
          };
        })(this);
      }

      Invalidator.prototype.invalidate = function() {
        var functName;
        if (typeof this.property.invalidate === "function") {
          return this.property.invalidate();
        } else {
          functName = 'invalidate' + this.property.charAt(0).toUpperCase() + this.property.slice(1);
          if (typeof this.obj[functName] === "function") {
            return this.obj[functName]();
          } else {
            return this.obj[this.property] = null;
          }
        }
      };

      Invalidator.prototype.unknown = function() {
        if (typeof this.property.unknown === "function") {
          return this.property.unknown();
        } else {
          return this.invalidate();
        }
      };

      Invalidator.prototype.addEventBind = function(event, target, callback) {
        if (!this.invalidationEvents.some(function(eventBind) {
          return eventBind.match(event, target);
        })) {
          return this.invalidationEvents.push(pluck(this.recycled, function(eventBind) {
            return eventBind.match(event, target);
          }) || new EventBind(event, target, callback));
        }
      };

      Invalidator.prototype.getUnknownCallback = function(prop, target) {
        return (function(_this) {
          return function() {
            if (!_this.unknowns.some(function(unknown) {
              return unknown.prop === prop && unknown.target === target;
            })) {
              _this.unknowns.push({
                "prop": prop,
                "target": target
              });
              return _this.unknown();
            }
          };
        })(this);
      };

      Invalidator.prototype.event = function(event, target) {
        if (target == null) {
          target = this.obj;
        }
        return this.addEventBind(event, target, this.invalidateCallback);
      };

      Invalidator.prototype.value = function(val, event, target) {
        if (target == null) {
          target = this.obj;
        }
        this.event(event, target);
        return val;
      };

      Invalidator.prototype.prop = function(prop, target) {
        if (target == null) {
          target = this.obj;
        }
        if (typeof prop !== 'string') {
          throw new Error('Property name must be a string');
        }
        this.addEventBind(prop + 'Invalidated', target, this.getUnknownCallback(prop, target));
        return this.value(target[prop], prop + 'Updated', target);
      };

      Invalidator.prototype.validateUnknowns = function(prop, target) {
        var unknowns;
        if (target == null) {
          target = this.obj;
        }
        unknowns = this.unknowns;
        this.unknowns = [];
        return unknowns.forEach(function(unknown) {
          return unknown.target[unknown.prop];
        });
      };

      Invalidator.prototype.isEmpty = function() {
        return this.invalidationEvents.length === 0;
      };

      Invalidator.prototype.bind = function() {
        return this.invalidationEvents.forEach(function(eventBind) {
          return eventBind.bind();
        });
      };

      Invalidator.prototype.recycle = function(callback) {
        var done, res;
        this.recycled = this.invalidationEvents;
        this.invalidationEvents = [];
        done = (function(_this) {
          return function() {
            _this.recycled.forEach(function(eventBind) {
              return eventBind.unbind();
            });
            return _this.recycled = [];
          };
        })(this);
        if (typeof callback === "function") {
          if (callback.length > 1) {
            return callback(this, done);
          } else {
            res = callback(this);
            done();
            return res;
          }
        } else {
          return done;
        }
      };

      Invalidator.prototype.unbind = function() {
        return this.invalidationEvents.forEach(function(eventBind) {
          return eventBind.unbind();
        });
      };

      return Invalidator;

    })();
    return Invalidator;
  });

  (function(definition) {
    Spark.PropertyInstance = definition();
    return Spark.PropertyInstance.definition = definition;
  })(function(dependencies) {
    var Invalidator, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    PropertyInstance = (function() {
      function PropertyInstance(property1, obj1) {
        this.property = property1;
        this.obj = obj1;
        this.init();
      }

      PropertyInstance.prototype.init = function() {
        this.value = this.ingest(this.property.options["default"]);
        this.calculated = false;
        this.initiated = false;
        return this.revalidateCallback = (function(_this) {
          return function() {
            return _this.get();
          };
        })(this);
      };

      PropertyInstance.prototype.get = function() {
        var initiated, old;
        if (this.property.options.get === false) {
          return void 0;
        } else if (typeof this.property.options.get === 'function') {
          return this.callOptionFunct("get");
        } else {
          if (this.invalidator) {
            this.invalidator.validateUnknowns();
          }
          if (!this.calculated) {
            old = this.value;
            initiated = this.initiated;
            this.calcul();
            if (initiated && this.value !== old) {
              this.changed(old);
            }
          }
          return this.output();
        }
      };

      PropertyInstance.prototype.set = function(val) {
        var old;
        if (this.property.options.set === false) {
          void 0;
        } else if (typeof this.property.options.set === 'function') {
          this.callOptionFunct("set", val);
        } else {
          val = this.ingest(val);
          this.revalidated();
          if (this.value !== val) {
            old = this.value;
            this.value = val;
            this.changed(old);
          }
        }
        return this;
      };

      PropertyInstance.prototype.invalidate = function() {
        if (this.calculated) {
          this.calculated = false;
          if (this._invalidateNotice()) {
            if (this.invalidator != null) {
              this.invalidator.unbind();
            }
          }
        }
        return this;
      };

      PropertyInstance.prototype.unknown = function() {
        if (this.calculated) {
          this._invalidateNotice();
        }
        return this;
      };

      PropertyInstance.prototype._invalidateNotice = function() {
        if (this.isImmediate()) {
          this.get();
          return false;
        } else {
          if (typeof this.obj.emitEvent === 'function') {
            this.obj.emitEvent(this.property.getInvalidateEventName());
          }
          if (this.getUpdater() != null) {
            this.getUpdater().bind();
          }
          return true;
        }
      };

      PropertyInstance.prototype.destroy = function() {
        if (this.invalidator != null) {
          return this.invalidator.unbind();
        }
      };

      PropertyInstance.prototype.callOptionFunct = function() {
        var args, funct;
        funct = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if (typeof funct === 'string') {
          funct = this.property.options[funct];
        }
        if (typeof funct.overrided === 'function') {
          args.push((function(_this) {
            return function() {
              var args;
              args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
              return _this.callOptionFunct.apply(_this, [funct.overrided].concat(slice.call(args)));
            };
          })(this));
        }
        return funct.apply(this.obj, args);
      };

      PropertyInstance.prototype.calcul = function() {
        if (typeof this.property.options.calcul === 'function') {
          if (!this.invalidator) {
            this.invalidator = new Invalidator(this, this.obj);
          }
          this.invalidator.recycle((function(_this) {
            return function(invalidator, done) {
              _this.value = _this.callOptionFunct("calcul", invalidator);
              done();
              if (invalidator.isEmpty()) {
                return _this.invalidator = null;
              } else {
                return invalidator.bind();
              }
            };
          })(this));
        }
        this.revalidated();
        return this.value;
      };

      PropertyInstance.prototype.revalidated = function() {
        this.calculated = true;
        this.initiated = true;
        if (this.getUpdater() != null) {
          return this.getUpdater().unbind();
        }
      };

      PropertyInstance.prototype.getUpdater = function() {
        if (typeof this.updater === 'undefined') {
          if (this.property.options.updater != null) {
            this.updater = this.property.options.updater;
            if (typeof this.updater.getBinder === 'function') {
              this.updater = this.updater.getBinder();
            }
            if (typeof this.updater.bind !== 'function' || typeof this.updater.unbind !== 'function') {
              console.error('Invalid updater');
              this.updater = null;
            } else {
              this.updater.callback = this.revalidateCallback;
            }
          } else {
            this.updater = null;
          }
        }
        return this.updater;
      };

      PropertyInstance.prototype.ingest = function(val) {
        if (typeof this.property.options.ingest === 'function') {
          return val = this.callOptionFunct("ingest", val);
        } else {
          return val;
        }
      };

      PropertyInstance.prototype.output = function() {
        if (typeof this.property.options.output === 'function') {
          return this.callOptionFunct("output", this.value);
        } else {
          return this.value;
        }
      };

      PropertyInstance.prototype.changed = function(old) {
        if (typeof this.property.options.change === 'function') {
          this.callOptionFunct("change", old);
        }
        if (typeof this.obj.emitEvent === 'function') {
          this.obj.emitEvent(this.property.getUpdateEventName(), [old]);
          return this.obj.emitEvent(this.property.getChangeEventName(), [old]);
        }
      };

      PropertyInstance.prototype.isImmediate = function() {
        return this.property.options.immediate !== false && (this.property.options.immediate === true || (typeof this.property.options.immediate === 'function' ? this.callOptionFunct("immediate") : (this.getUpdater() == null) && ((typeof this.obj.getListeners === 'function' && this.obj.getListeners(this.property.getChangeEventName()).length > 0) || typeof this.property.options.change === 'function')));
      };

      PropertyInstance.bind = function(target, prop) {
        var maj;
        maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
        Object.defineProperty(target, prop.name, {
          configurable: true,
          get: function() {
            return prop.getInstance(this).get();
          },
          set: function(val) {
            return prop.getInstance(this).set(val);
          }
        });
        target['get' + maj] = function() {
          return prop.getInstance(this).get();
        };
        target['set' + maj] = function(val) {
          prop.getInstance(this).set(val);
          return this;
        };
        return target['invalidate' + maj] = function() {
          prop.getInstance(this).invalidate();
          return this;
        };
      };

      return PropertyInstance;

    })();
    return PropertyInstance;
  });

  (function(definition) {
    Spark.CollectionProperty = definition();
    return Spark.CollectionProperty.definition = definition;
  })(function(dependencies) {
    var Collection, CollectionProperty, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Spark.PropertyInstance;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Spark.Collection;
    CollectionProperty = (function(superClass) {
      extend(CollectionProperty, superClass);

      function CollectionProperty() {
        return CollectionProperty.__super__.constructor.apply(this, arguments);
      }

      CollectionProperty.prototype.ingest = function(val) {
        if (typeof this.property.options.ingest === 'function') {
          val = this.callOptionFunct("ingest", val);
        }
        if (val == null) {
          return [];
        } else if (typeof val.toArray === 'function') {
          return val.toArray();
        } else if (Array.isArray(val)) {
          return val.slice();
        } else {
          return [val];
        }
      };

      CollectionProperty.prototype.output = function() {
        var col, prop, value;
        value = this.value;
        if (typeof this.property.options.output === 'function') {
          value = this.callOptionFunct("output", this.value);
        }
        prop = this;
        col = Collection.newSubClass(this.property.options.collection, value);
        col.changed = function(old) {
          return prop.changed(old);
        };
        return col;
      };

      return CollectionProperty;

    })(PropertyInstance);
    return CollectionProperty;
  });

  (function(definition) {
    Spark.ComposedProperty = definition();
    return Spark.ComposedProperty.definition = definition;
  })(function(dependencies) {
    var Collection, ComposedProperty, Invalidator, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Spark.PropertyInstance;
    Invalidator = dependencies.hasOwnProperty("Invalidator") ? dependencies.Invalidator : Spark.Invalidator;
    Collection = dependencies.hasOwnProperty("Collection") ? dependencies.Collection : Spark.Collection;
    ComposedProperty = (function(superClass) {
      extend(ComposedProperty, superClass);

      function ComposedProperty() {
        return ComposedProperty.__super__.constructor.apply(this, arguments);
      }

      ComposedProperty.prototype.init = function() {
        ComposedProperty.__super__.init.call(this);
        if (this.property.options.hasOwnProperty('default')) {
          this["default"] = this.property.options["default"];
        } else {
          this["default"] = this.value = true;
        }
        this.members = new ComposedProperty.Members(this.property.options.members);
        this.members.changed = (function(_this) {
          return function(old) {
            return _this.invalidate();
          };
        })(this);
        return this.join = typeof this.property.options.composed === 'function' ? this.property.options.composed : this.property.options["default"] === false ? ComposedProperty.joinFunctions.or : ComposedProperty.joinFunctions.and;
      };

      ComposedProperty.prototype.calcul = function() {
        if (!this.invalidator) {
          this.invalidator = new Invalidator(this, this.obj);
        }
        this.invalidator.recycle((function(_this) {
          return function(invalidator, done) {
            _this.value = _this.members.reduce(function(prev, member) {
              var val;
              val = typeof member === 'function' ? member(_this.invalidator) : member;
              return _this.join(prev, val);
            }, _this["default"]);
            done();
            if (invalidator.isEmpty()) {
              return _this.invalidator = null;
            } else {
              return invalidator.bind();
            }
          };
        })(this));
        this.revalidated();
        return this.value;
      };

      ComposedProperty.bind = function(target, prop) {
        PropertyInstance.bind(target, prop);
        return Object.defineProperty(target, prop.name + 'Members', {
          configurable: true,
          get: function() {
            return prop.getInstance(this).members;
          }
        });
      };

      ComposedProperty.joinFunctions = {
        and: function(a, b) {
          return a && b;
        },
        or: function(a, b) {
          return a || b;
        }
      };

      return ComposedProperty;

    })(PropertyInstance);
    ComposedProperty.Members = (function(superClass) {
      extend(Members, superClass);

      function Members() {
        return Members.__super__.constructor.apply(this, arguments);
      }

      Members.prototype.addPropertyRef = function(name, obj) {
        var fn;
        if (this.findPropertyRefIndex(name, obj) === -1) {
          fn = function(invalidator) {
            return invalidator.prop(name, obj);
          };
          fn.ref = {
            name: name,
            obj: obj
          };
          return this.push(fn);
        }
      };

      Members.prototype.findPropertyRefIndex = function(name, obj) {
        return this._array.findIndex(function(member) {
          return (member.ref != null) && member.ref.obj === obj && member.ref.name === name;
        });
      };

      Members.prototype.removePropertyRef = function(name, obj) {
        var index, old;
        index = this.findPropertyRefIndex(name, obj);
        if (index !== -1) {
          old = this.toArray();
          this._array.splice(index, 1);
          return this.changed(old);
        }
      };

      return Members;

    })(Collection);
    return ComposedProperty;
  });

  (function(definition) {
    Spark.Property = definition();
    return Spark.Property.definition = definition;
  })(function(dependencies) {
    var CollectionProperty, ComposedProperty, Property, PropertyInstance;
    if (dependencies == null) {
      dependencies = {};
    }
    PropertyInstance = dependencies.hasOwnProperty("PropertyInstance") ? dependencies.PropertyInstance : Spark.PropertyInstance;
    CollectionProperty = dependencies.hasOwnProperty("CollectionProperty") ? dependencies.CollectionProperty : Spark.CollectionProperty;
    ComposedProperty = dependencies.hasOwnProperty("ComposedProperty") ? dependencies.ComposedProperty : Spark.ComposedProperty;
    Property = (function() {
      function Property(name1, options1) {
        var calculated;
        this.name = name1;
        this.options = options1 != null ? options1 : {};
        calculated = false;
      }

      Property.prototype.bind = function(target) {
        var parent, prop;
        prop = this;
        if (!(typeof target.getProperty === 'function' && target.getProperty(this.name) === this)) {
          if (typeof target.getProperty === 'function' && ((parent = target.getProperty(this.name)) != null)) {
            this.override(parent);
          }
          this.getInstanceType().bind(target, prop);
          target._properties = (target._properties || []).concat([prop]);
          if (parent != null) {
            target._properties = target._properties.filter(function(existing) {
              return existing !== parent;
            });
          }
          this.checkFunctions(target);
          this.checkAfterAddListener(target);
        }
        return prop;
      };

      Property.prototype.override = function(parent) {
        var key, ref, results, value;
        if (this.options.parent == null) {
          this.options.parent = parent.options;
          ref = parent.options;
          results = [];
          for (key in ref) {
            value = ref[key];
            if (typeof this.options[key] === 'function' && typeof value === 'function') {
              results.push(this.options[key].overrided = value);
            } else if (typeof this.options[key] === 'undefined') {
              results.push(this.options[key] = value);
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      };

      Property.prototype.checkFunctions = function(target) {
        var funct, name, ref, results;
        this.checkAfterAddListener(target);
        ref = Property.fn;
        results = [];
        for (name in ref) {
          funct = ref[name];
          if (typeof target[name] === 'undefined') {
            results.push(target[name] = funct);
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      Property.prototype.checkAfterAddListener = function(target) {
        var overrided;
        if (typeof target.addListener === 'function' && typeof target.afterAddListener === 'undefined' && typeof target.addListener.overrided === 'undefined') {
          target.afterAddListener = Property.optionalFn.afterAddListener;
          overrided = target.addListener;
          target.addListener = function(evt, listener) {
            this.addListener.overrided.call(this, evt, listener);
            return this.afterAddListener(evt);
          };
          return target.addListener.overrided = overrided;
        }
      };

      Property.prototype.getInstanceVarName = function() {
        return this.options.instanceVarName || '_' + this.name;
      };

      Property.prototype.isInstantiated = function(obj) {
        return obj[this.getInstanceVarName()] != null;
      };

      Property.prototype.getInstance = function(obj) {
        var Type, varName;
        varName = this.getInstanceVarName();
        if (!this.isInstantiated(obj)) {
          Type = this.getInstanceType();
          obj[varName] = new Type(this, obj);
        }
        return obj[varName];
      };

      Property.prototype.getInstanceType = function() {
        if (this.options.composed != null) {
          return ComposedProperty;
        }
        if (this.options.collection != null) {
          return CollectionProperty;
        }
        return PropertyInstance;
      };

      Property.prototype.getChangeEventName = function() {
        return this.options.changeEventName || this.name + 'Changed';
      };

      Property.prototype.getUpdateEventName = function() {
        return this.options.changeEventName || this.name + 'Updated';
      };

      Property.prototype.getInvalidateEventName = function() {
        return this.options.changeEventName || this.name + 'Invalidated';
      };

      Property.fn = {
        getProperty: function(name) {
          return this._properties.find(function(prop) {
            return prop.name === name;
          });
        },
        getPropertyInstance: function(name) {
          var res;
          res = this.getProperty(name);
          if (res) {
            return res.getInstance(this);
          }
        },
        getProperties: function() {
          return this._properties.slice();
        },
        getPropertyInstances: function() {
          return this._properties.map((function(_this) {
            return function(prop) {
              return prop.getInstance(_this);
            };
          })(this));
        },
        getInstantiatedProperties: function() {
          return this._properties.filter((function(_this) {
            return function(prop) {
              return prop.isInstantiated(_this);
            };
          })(this)).map((function(_this) {
            return function(prop) {
              return prop.getInstance(_this);
            };
          })(this));
        },
        setProperties: function(data, options) {
          var key, prop, val;
          if (options == null) {
            options = {};
          }
          for (key in data) {
            val = data[key];
            if (((options.whitelist == null) || options.whitelist.indexOf(key) !== -1) && ((options.blacklist == null) || options.blacklist.indexOf(key) === -1)) {
              prop = this.getPropertyInstance(key);
              if (prop != null) {
                prop.set(val);
              }
            }
          }
          return this;
        },
        destroyProperties: function() {
          this.getInstantiatedProperties().forEach((function(_this) {
            return function(prop) {
              return prop.destroy();
            };
          })(this));
          this._properties = [];
          return true;
        }
      };

      Property.optionalFn = {
        afterAddListener: function(event) {
          return this._properties.forEach((function(_this) {
            return function(prop) {
              if (prop.getChangeEventName() === event) {
                return prop.getInstance(_this).get();
              }
            };
          })(this));
        }
      };

      return Property;

    })();
    return Property;
  });

  (function(definition) {
    Spark.Element = definition();
    return Spark.Element.definition = definition;
  })(function(dependencies) {
    var Element, Property;
    if (dependencies == null) {
      dependencies = {};
    }
    Property = dependencies.hasOwnProperty("Property") ? dependencies.Property : Spark.Property;
    Element = (function() {
      function Element() {}

      Element.elementKeywords = ['extended', 'included', '__super__', 'constructor'];

      Element.prototype.tap = function(name) {
        var args;
        args = Array.prototype.slice.call(arguments);
        if (typeof name === 'function') {
          name.apply(this, args.slice(1));
        } else {
          this[name].apply(this, args.slice(1));
        }
        return this;
      };

      Element.prototype.callback = function(name) {
        if (this._callbacks == null) {
          this._callbacks = {};
        }
        if (this._callbacks[name] != null) {
          return this._callbacks[name];
        } else {
          return this._callbacks[name] = (function(_this) {
            return function() {
              var args;
              args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
              _this[name].call(_this, args);
              return null;
            };
          })(this);
        }
      };

      Element.extend = function(obj) {
        var key, ref, value;
        for (key in obj) {
          value = obj[key];
          if (indexOf.call(Element.elementKeywords, key) < 0) {
            this[key] = value;
          }
        }
        if (obj.prototype != null) {
          this.include(obj.prototype);
        }
        if ((ref = obj.extended) != null) {
          ref.apply(this);
        }
        return this;
      };

      Element.include = function(obj) {
        var j, key, len, property, ref, value;
        for (key in obj) {
          value = obj[key];
          if (indexOf.call(Element.elementKeywords, key) < 0) {
            if (key === '_properties') {
              for (j = 0, len = value.length; j < len; j++) {
                property = value[j];
                property.bind(this.prototype);
              }
            } else {
              this.prototype[key] = value;
            }
          }
        }
        if ((ref = obj.included) != null) {
          ref.apply(this);
        }
        return this;
      };

      Element.property = function(prop, desc) {
        return (new Property(prop, desc)).bind(this.prototype);
      };

      Element.properties = function(properties) {
        var desc, prop, results;
        results = [];
        for (prop in properties) {
          desc = properties[prop];
          results.push(this.property(prop, desc));
        }
        return results;
      };

      return Element;

    })();
    return Element;
  });

  (function(definition) {
    Spark.Updater = definition();
    return Spark.Updater.definition = definition;
  })(function() {
    var Updater;
    Updater = (function() {
      function Updater() {
        this.callbacks = [];
      }

      Updater.prototype.update = function() {
        return this.callbacks.forEach(function(callback) {
          return callback();
        });
      };

      Updater.prototype.addCallback = function(callback) {
        if (!this.callbacks.includes(callback)) {
          return this.callbacks.push(callback);
        }
      };

      Updater.prototype.removeCallback = function(callback) {
        var index;
        index = this.callbacks.indexOf(callback);
        if (index !== -1) {
          return this.callbacks.splice(index, 1);
        }
      };

      Updater.prototype.getBinder = function() {
        return new Updater.Binder(this);
      };

      return Updater;

    })();
    Updater.Binder = (function() {
      function Binder(target1) {
        this.target = target1;
        this.binded = false;
      }

      Binder.prototype.bind = function() {
        if (!this.binded && (this.callback != null)) {
          this.target.addCallback(this.callback);
        }
        return this.binded = true;
      };

      Binder.prototype.unbind = function() {
        if (this.binded && (this.callback != null)) {
          this.target.removeCallback(this.callback);
        }
        return this.binded = false;
      };

      return Binder;

    })();
    return Updater;
  });

}).call(this);
