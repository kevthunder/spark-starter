
class Overrider

  @Override: {
    makeMany: (target, namespace, overrides)->
      for key, fn of overrides
        @make = target, namespace, key, fn
    make: (target, namespace, fnName, fn)->
      override = {
        current: fn
        currentNamespace: namespace
        name: fnName
      }
      override['with'+namespace] = fn

      @apply(target, override)

    apply: (target, override)->
      fnName = override.name
      overrides = if target._overrides? then Object.assign({},target._overrides) else {}

      without = target._overrides?[fnName]?.current || target[fnName] || ->
      override = if overrides[fnName]? then Object.assign({},overrides[fnName],override) else override

      override['without'+currentNamespace] = without

      Object.defineProperty target, fnName,
        configurable: true
        get: ->
          finalFn = override.current.bind(this)
          for key, fn of override
            unless key == 'name'
              finalFn[key] = fn.bind(this)
          if this.constructor.prototype != this
            Object.defineProperty this, fnName,
              value: finalFn
          finalFn

      overrides[fnName] = override
      target._overrides = overrides

  }


  @overrides: (overrides)->
    @Override.makeMany(@prototype, @name, overrides)


  getFinalProperties: ->
    if @._properties?
      ['_overrides'].concat @._overrides.map((override)->override.name)
    else
      []

  extended: (target)->
    if @._overrides?
      @constructor.Override.makeMany(target,@._overrides)


