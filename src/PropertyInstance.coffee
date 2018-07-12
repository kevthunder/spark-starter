Invalidator = require('./Invalidator')

class PropertyInstance
  constructor: (@property, @obj) ->
    @init()
  init: ->
    @value = @ingest(@default)
    @calculated = false
    @revalidateCallback = =>
      @get()

  callbackGet:->
    res = @callOptionFunct("get")
    @revalidated()
    res

  dynamicGet:->
    if @invalidator
      @invalidator.validateUnknowns()
    if @isActive()
      if !@calculated
        old = @value
        initiated = @initiated
        @calcul()
        if @value != old
          if initiated 
            @changed(old)
          else if typeof @obj.emitEvent == 'function'
            @obj.emitEvent(@updateEventName, [old])
      if @pendingChanges
        @changed(@pendingOld)
      @output()
    else
      @initiated = true
      undefined
  
  set: (val)->
    if typeof @property.options.set == 'function'
      @callOptionFunct("set",val)
    else
      val = @ingest(val)
      @revalidated()
      if @value != val
        old = @value
        @value = val
        @manual = true
        @changed(old)
    this
  
  invalidate: ->
    if @calculated || @active == false
      @calculated = false
      if @_invalidateNotice()
        if @invalidator?
          @invalidator.unbind()
    this

  unknown: ->
    if @calculated || @active == false
      @_invalidateNotice()
    this

  _invalidateNotice: ->
    if @isImmediate()
      @get()
      false
    else 
      if typeof @obj.emitEvent == 'function'
        @obj.emitEvent(@invalidateEventName)
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
    funct.apply(@obj, args)

  isActive: ->
    if typeof @property.options.active == "boolean"
      @property.options.active
    else if typeof @property.options.active == 'function'
      invalidator = @activeInvalidator || new Invalidator(this, @obj)
      invalidator.recycle (invalidator,done)=> 
        @active = @callOptionFunct("active", invalidator)
        done()
        if @active || invalidator.isEmpty()
          invalidator.unbind()
          @activeInvalidator = null
        else
          @invalidator = invalidator
          @activeInvalidator = invalidator
          invalidator.bind()
      @active
    else
      true

  calcul: ->
    if typeof @property.options.calcul == 'function'
      unless @invalidator
        @invalidator = new Invalidator(this, @obj)
      @invalidator.recycle (invalidator,done)=> 
        @value = @callOptionFunct("calcul", invalidator)
        @manual = false
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
    if @isActive()
      @pendingChanges = false
      @pendingOld = undefined
      @callChangedFunctions(old)
      if typeof @obj.emitEvent == 'function'
        @obj.emitEvent(@updateEventName, [old])
        @obj.emitEvent(@changeEventName, [old])
    else
      @pendingChanges = true
      if typeof @pendingOld == 'undefined'
        @pendingOld = old
    this

  callChangedFunctions: (old)->
    if typeof @property.options.change == 'function'
      @callOptionFunct("change", old)

  hasChangedFunctions: ()->
    typeof @property.options.change == 'function'

  hasChangedEvents: ()->
    typeof @obj.getListeners == 'function' and
      @obj.getListeners(@changeEventName).length > 0
        
  isImmediate: ->
    @property.options.immediate != false and
    (
      @property.options.immediate == true or
        if typeof @property.options.immediate == 'function'
          @callOptionFunct("immediate")
        else
          !@getUpdater()? and (@hasChangedEvents() or @hasChangedFunctions())
    )

  @detect = (prop)->
    unless prop.instanceType?
      prop.instanceType = class extends PropertyInstance

    if typeof prop.options.get == 'function'
      prop.instanceType::get = @::callbackGet
    else
      prop.instanceType::get = @::dynamicGet

    prop.instanceType::default = prop.options.default
    prop.instanceType::initiated = typeof prop.options.default != 'undefined'
    @setEventNames(prop);

  @setEventNames = (prop)->
    prop.instanceType::changeEventName = prop.options.changeEventName || prop.name+'Changed'
    prop.instanceType::updateEventName = prop.options.updateEventName || prop.name+'Updated'
    prop.instanceType::invalidateEventName = prop.options.invalidateEventName || prop.name+'Invalidated'

  @bind = (target,prop)->
    maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1)
    opt = {
      configurable: true
      get: ->
        prop.getInstance(this).get()
    }
    unless prop.options.set == false
      opt.set = (val)->
        prop.getInstance(this).set(val)
    Object.defineProperty target, prop.name, opt
    target['get'+maj] = ->
      prop.getInstance(this).get()
    unless prop.options.set == false
      target['set'+maj] = (val)->
        prop.getInstance(this).set(val)
        this
    target['invalidate'+maj] = ->
        prop.getInstance(this).invalidate()
        this
