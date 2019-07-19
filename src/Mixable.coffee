
module.exports = class Mixable
  @Extension:
    makeOnce: (source, target) ->
      unless target.extensions?.includes(source)
        @make(source, target)

    make: (source, target) ->
      for prop in @getExtensionProperties(source, target)
        Object.defineProperty(target, prop.name, prop)
      if source.getFinalProperties and target.getFinalProperties
        originalFinalProperties = target.getFinalProperties
        target.getFinalProperties = ->
          source.getFinalProperties().concat(originalFinalProperties.call(this))
      else
        target.getFinalProperties = source.getFinalProperties || target.getFinalProperties
      target.extensions = (target.extensions || []).concat([source])
      if typeof source.extended == 'function'
        source.extended(target)

    alwaysFinal: ['extended', 'extensions', '__super__', 'constructor', 'getFinalProperties']

    getExtensionProperties: (source, target) ->
      alwaysFinal = @alwaysFinal

      targetChain = @getPrototypeChain(target)

      props = [];
      @getPrototypeChain(source).every (obj)->
        unless targetChain.includes(obj)
          exclude = alwaysFinal
          if source.getFinalProperties?
            exclude = exclude.concat(source.getFinalProperties())
          if typeof obj == 'function'
            exclude = exclude.concat(["length", "prototype", "name"])

          props = props.concat(
            Object.getOwnPropertyNames(obj).filter (key)=>
                !target.hasOwnProperty(key) and key.substr(0,2) != "__" and key not in exclude and !props.find((prop)->prop.name == key)
              .map (key)->
                prop = Object.getOwnPropertyDescriptor(obj, key)
                prop.name = key
                prop
          )
          true
      props

    getPrototypeChain: (obj)->
      chain = []
      basePrototype = Object.getPrototypeOf(Object)
      loop
        chain.push(obj)
        unless (obj = Object.getPrototypeOf(obj)) and obj != Object and obj != basePrototype
          break
      chain

  @extend: (obj) ->
    @Extension.make(obj, @)
    if obj.prototype?
      @Extension.make(obj.prototype, @.prototype)

  @include: (obj) ->
    @Extension.make(obj, @.prototype)

