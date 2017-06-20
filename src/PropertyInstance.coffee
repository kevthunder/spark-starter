#= require <Invalidator>
#--- Standalone ---
Invalidator = @Spark?.Invalidator or require('./Invalidator')
#--- Standalone end ---

class PropertyInstance
  constructor: (@property, @obj) ->
    @value = @property.options.default
    @calculated = false
    
  get: ->
    if @property.options.get == false
      undefined
    else if typeof @property.options.get == 'function'
      @callOptionFunct("get")
    else
      if !@calculated
        @calcul()
      @value
  
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
        @invalidator = new Invalidator(this)
      @invalidator.recycle (invalidator)=> 
        @value = @callOptionFunct("calcul", invalidator)
        if invalidator.isEmpty()
          @invalidator = null
        else
          invalidator.bind()
    @calculated = true
    @value
    
  ingest: (val)->
    if typeof @property.options.ingest == 'function'
      val = @callOptionFunct("ingest", val)
    else
      val
      
  changed: (old)->
    if typeof @property.options.change == 'function'
      @callOptionFunct("change", old)
    if typeof @obj.emitEvent == 'function'
      @obj.emitEvent(@property.getChangeEventName(), [old])
        
  isImmediate: ->
    @property.options.immediate == true or (
      typeof @obj.getListeners == 'function' and
      @obj.getListeners(@property.getChangeEventName()).length > 0
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
    