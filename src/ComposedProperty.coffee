#= require <PropertyInstance>
#= require <Invalidator>
#= require <Collection>
#--- Standalone ---
PropertyInstance = @Spark?.PropertyInstance or require('./PropertyInstance')
Invalidator = @Spark?.Invalidator or require('./Invalidator')
Collection = @Spark?.Collection or require('./Collection')
#--- Standalone end ---

class ComposedProperty extends PropertyInstance
  init: ()->
    super()
    if @property.options.hasOwnProperty('default')
      @default = @property.options.default
    else
      @default = @value = true
    @members = new ComposedProperty.Members(@property.options.members)
    @members.changed = (old)=> @invalidate()
    @join = if typeof @property.options.composed == 'function'
      @property.options.composed
    else if @property.options.default == false
      ComposedProperty.joinFunctions.or
    else 
      ComposedProperty.joinFunctions.and

  calcul: ->
    unless @invalidator
      @invalidator =  new Invalidator(this, @obj)
    @invalidator.recycle (invalidator,done)=> 
      @value = @members.reduce (prev,member)=>
          val = if typeof member == 'function' 
            member(@invalidator)
          else
            member
          @join(prev,val)
        , @default
      done()
      if invalidator.isEmpty()
        @invalidator = null
      else
        invalidator.bind()
    @revalidated()
    @value

  @bind = (target,prop)->
    PropertyInstance.bind(target,prop)
    Object.defineProperty target, prop.name+'Members', {
      configurable: true
      get: ->
        prop.getInstance(this).members
    }

  @joinFunctions = {
    and: (a,b)->
      a && b
    or: (a,b)->
      a || b
  }

class ComposedProperty.Members extends Collection
  addPropertyRef: (name,obj)->
    if @findPropertyRefIndex(name,obj) == -1
      fn = (invalidator)->
        invalidator.prop(name,obj)
      fn.ref = {
        name: name
        obj: obj
      }
      @push(fn)
  findPropertyRefIndex: (name,obj)->
    @_array.findIndex (member)->
      member.ref? && member.ref .obj == obj && member.ref .name == name
  removePropertyRef: (name,obj)->
    index = @findPropertyRefIndex(name,obj)
    if index != -1
      old = @toArray()
      @_array.splice(index, 1)
      @changed(old)

  
if Spark?
  Spark.ComposedProperty = ComposedProperty
#--- Standalone ---
if module?
  module.exports = ComposedProperty
else
  unless @Spark?
    @Spark = {}
  @Spark.ComposedProperty = ComposedProperty
#--- Standalone end ---