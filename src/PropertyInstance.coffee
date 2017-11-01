#= require <Invalidator>
#--- Standalone ---
Invalidator = @Spark?.Invalidator or require('./Invalidator')
#--- Standalone end ---

class PropertyInstance
  constructor: (@property, @obj) ->
    @init()
  init: ->
    @value = @ingest(@property.options.default)
    @calculated = false
    @initiated = false
    @revalidateCallback = =>
      @get()

  get: ->
    if @property.options.get == false
      undefined
    else if typeof @property.options.get == 'function'
      @callOptionFunct("get")
    else
      if @invalidator
        @invalidator.validateUnknowns()
      if !@calculated
        old = @value
        initiated = @initiated
        @calcul()
        if initiated && @value != old
          @changed(old)
      @output()
  
  set: (val)->
    if @property.options.set == false
      undefined
    else if typeof @property.options.set == 'function'
      @callOptionFunct("set",val)
    else
      val = @ingest(val)
      @revalidated()
      if @value != val
        old = @value
        @value = val
        @changed(old)
    this
  
  invalidate: ->
    if @calculated
      @calculated = false
      if @_invalidateNotice()
        if @invalidator?
          @invalidator.unbind()
    this

  unknown: ->
    if @calculated
      @_invalidateNotice()
    this

  _invalidateNotice: ->
    if @isImmediate()
      @get()
      false
    else 
      if typeof @obj.emitEvent == 'function'
        @obj.emitEvent(@property.getInvalidateEventName())
      if @getUpdater()?
        @getUpdater().bind()
      true


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
      @invalidator.recycle (invalidator,done)=> 
        @value = @callOptionFunct("calcul", invalidator)
        done()
        if invalidator.isEmpty()
          @invalidator = null
        else
          invalidator.bind()
    @revalidated()
    @value

  revalidated: ->
    @calculated = true
    @initiated = true
    if @getUpdater()?
      @getUpdater().unbind()

  getUpdater: ->
    if typeof @updater == 'undefined'
      if @property.options.updater?
        @updater = @property.options.updater
        if typeof @updater.getBinder == 'function'
          @updater = @updater.getBinder()
        if typeof @updater.bind != 'function' or typeof @updater.unbind != 'function'
          console.error 'Invalid updater'
          @updater = null
        else
          @updater.callback = @revalidateCallback
      else
        @updater = null
    @updater
    
  ingest: (val)->
    if typeof @property.options.ingest == 'function'
      val = @callOptionFunct("ingest", val)
    else
      val
  
  output: ->
    if typeof @property.options.output == 'function'
      @callOptionFunct("output", @value)
    else
      @value
      
  changed: (old)->
    if typeof @property.options.change == 'function'
      @callOptionFunct("change", old)
    if typeof @obj.emitEvent == 'function'
      @obj.emitEvent(@property.getUpdateEventName(), [old])
      @obj.emitEvent(@property.getChangeEventName(), [old])
        
  isImmediate: ->
    @property.options.immediate != false and
    (
      @property.options.immediate == true or
        if typeof @property.options.immediate == 'function' then @callOptionFunct("immediate")
        else
          !@getUpdater()? and (
            (
              typeof @obj.getListeners == 'function' and
              @obj.getListeners(@property.getChangeEventName()).length > 0
            ) or
            typeof @property.options.change == 'function'
          )
    )

  @bind = (target,prop)->
    maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1)
    Object.defineProperty target, prop.name, {
      configurable: true
      get: ->
        prop.getInstance(this).get()
      set: (val)->
        prop.getInstance(this).set(val)
    }
    target['get'+maj] = ->
        prop.getInstance(this).get()
    target['set'+maj] = (val)->
        prop.getInstance(this).set(val)
        this
    target['invalidate'+maj] = ->
        prop.getInstance(this).invalidate()
        this
    
    
    
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
    