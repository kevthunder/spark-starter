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
      @property.options.get.call(@obj)
    else
      if !@calculated
        @calcul()
      @value
  
  set: (val)->
    if @property.options.set == false
      undefined
    else if typeof @property.options.set == 'function'
      @property.options.set.call(@obj,val)
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

  calcul: ->
    if typeof @property.options.calcul == 'function'
      unless @invalidator
        @invalidator = new Invalidator(this)
      @invalidator.recycle (invalidator)=> 
        @value = @property.options.calcul.call(@obj,invalidator)
        if invalidator.isEmpty()
          @invalidator = null
        else
          invalidator.bind()
    @calculated = true
    @value
    
  ingest: (val)->
    if typeof @property.options.ingest == 'function'
      val = @property.options.ingest.call(@obj,val)
    else
      val
      
  changed: (old)->
    if typeof @property.options.change == 'function'
      @property.options.change.call(@obj,old)
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
    