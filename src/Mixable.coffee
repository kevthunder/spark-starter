
class Mixable
  @Extension:
    make: (source, target) ->
      for key in @getExtensionProperties(source, target)
        target[key] = source[key]
      target.extensions = (target.extensions || []).concat([source])
      if typeof source.extended == 'function'
        source.extended(target)

    alwaysFinal: ['extended', 'extensions', '__super__', 'constructor']

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
              !target.hasOwnProperty(key) and key.substr(0,2) != "__" and key not in exclude
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

