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
    @members = new Collection()
    @members.changed = (old)=> @invalidate()
    @join = if typeof @property.options.composed == 'function'
      @property.options.composed
    else if @property.options.default == false
      ComposedProperty.or
    else 
      ComposedProperty.and

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

  @and = (a,b)->
    a && b
  @or = (a,b)->
    a || b
  

  
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