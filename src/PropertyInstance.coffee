#= require <Invalidator>
#= require <Collection>
#--- Standalone ---
Invalidator = @Spark?.Invalidator or require('./Invalidator')
Collection = @Spark?.Invalidator or require('./Collection')
#--- Standalone end ---

class PropertyInstance
  constructor: (@property, @obj) ->
    @value = @ingest(@property.options.default)
    @calculated = false
    
  get: ->
    if @property.options.get == false
      undefined
    else if typeof @property.options.get == 'function'
      @callOptionFunct("get")
    else
      if !@calculated
        @calcul()
      @output()
  
  set: (val)->
    if @property.options.set == false
      undefined
    else if typeof @property.options.set == 'function'
      @callOptionFunct("set",val)
    else
      val = @ingest(val)
      if @value != val
        old = @value
        @value = val
        @changed(old)
    this
  
  invalidate: ->
    if @calculated
      @calculated = false
      if @isImmediate()
        old = @value
        @get()
        if @value != old
          @changed(old)
      else if @invalidator?
        @invalidator.unbind()

  destroy: ->
    if @invalidator?
      @invalidator.unbind()
      
  callOptionFunct: (funct, args...) ->
    if typeof funct == 'string'
      funct = @property.options[funct]
    if typeof funct.overrided == 'function'
      args.push (args...) => 
        @callOptionFunct funct.overrided, args...
    funct.apply(@obj,args)

  calcul: ->
    if typeof @property.options.calcul == 'function'
      unless @invalidator
        @invalidator = new Invalidator(this, @obj)
      @invalidator.recycle (invalidator)=> 
        @value = @callOptionFunct("calcul", invalidator)
        if invalidator.isEmpty()
          @invalidator = null
        else
          invalidator.bind()
    @calculated = true
    @value
    
  isACollection: (val)->
    @property.options.collection?
    
  ingest: (val)->
    if typeof @property.options.ingest == 'function'
      val = @callOptionFunct("ingest", val)
    else if @isACollection()
      if !val?
        []
      else if typeof val.toArray == 'function'
        val.toArray()
      else if Array.isArray(val)
        val.slice()
      else
        [val]
    else
      val
  
  output: ->
    if typeof @property.options.output == 'function'
      @callOptionFunct("output", @value)
    else if @isACollection()
      prop = this
      col = Collection.newSubClass(@property.options.collection, @value)
      col.changed = (old)-> prop.changed(old)
      col
    else
      @value
      
  changed: (old)->
    if typeof @property.options.change == 'function'
      @callOptionFunct("change", old)
    if typeof @obj.emitEvent == 'function'
      @obj.emitEvent(@property.getChangeEventName(), [old])
        
  isImmediate: ->
    @property.options.immediate != false and
    (
      @property.options.immediate == true or 
      (
        typeof @obj.getListeners == 'function' and
        @obj.getListeners(@property.getChangeEventName()).length > 0
      ) or
      typeof @property.options.change == 'function'
    )
    
    
    
if Spark?
  Spark.PropertyInstance = PropertyInstance
#--- Standalone ---
if module?
  module.exports = PropertyInstance
else
  unless @Spark?
    @Spark = {}
  @Spark.PropertyInstance = PropertyInstance
#--- Standalone end ---
    