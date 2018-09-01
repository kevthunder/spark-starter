
class Overrider

  @Override: {
    makeMany: (target, namespace, overrides)->
      for key, fn of overrides
        override = @make target, namespace, key, fn

    applyMany: (target, namespace, overrides)->
      for key, override of overrides
        if typeof override == "function"
          override = @make target, namespace, key, override
        @apply target, namespace, override

    make: (target, namespace, fnName, fn)->
      override = {
        fn:
          current: fn
        name: fnName
      }
      override.fn['with'+namespace] = fn
      override

    apply: (target, namespace, override)->
      fnName = override.name
      overrides = if target._overrides? then Object.assign({},target._overrides) else {}

      without = target._overrides?[fnName]?.current || target[fnName] || ->

      override = Object.assign({}, override)
      if overrides[fnName]?
        override.fn = Object.assign({}, overrides[fnName].fn, override.fn)
      else
        override.fn = Object.assign({}, override.fn)

      override.fn['without'+namespace] = without

      Object.defineProperty target, fnName,
        configurable: true
        get: ->
          finalFn = override.fn.current.bind(this)
          for key, fn of override.fn
            finalFn[key] = fn.bind(this)
          if this.constructor.prototype != this
            Object.defineProperty this, fnName,
              value: finalFn
          finalFn

      overrides[fnName] = override
      target._overrides = overrides

  }


  @overrides: (overrides)->
    @Override.applyMany(@prototype, @name, overrides)


  getFinalProperties: ->
    if @._properties?
      ['_overrides'].concat @._overrides.map((override)->override.name)
    else
      []

  extended: (target)->
    if @._overrides?
      @constructor.Override.applyMany(target, @constructor.name, @._overrides)


