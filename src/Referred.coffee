class Referred
  
  compareRefered: (refered) -> 
    @constructor.compareRefered(refered, this)

  getRef: ->

  Object.defineProperty @::, 'ref',
    get: -> @getRef()

  @compareRefered = (obj1, obj2)->
    obj1 == obj2 || (
      obj1? and obj2? and
      obj1.constructor == obj2.constructor and
      @compareRef(obj1.ref, obj2.ref)
    )

  @compareRef = (ref1,ref2)->
    ref1? and ref2? and (
      ref1 == ref2 or (
        Array.isArray(ref1) and Array.isArray(ref1) and
        ref1.every (val,i)=>
          @compareRefered(ref1[i], ref2[i])
      ) or (
        typeof ref1 == "object" and typeof ref2 == "object" and
        Object.keys(ref1).join() == Object.keys(ref2).join() and 
        Object.keys(ref1).every (key)=>
          @compareRefered(ref1[key], ref2[key])
      )
    )
