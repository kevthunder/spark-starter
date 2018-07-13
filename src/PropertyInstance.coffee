class PropertyInstance
  constructor: (@property, @obj) ->
    @init()
  init: ->
    @value = @ingest(@default)
    @calculated = false
    @revalidateCallback = =>
      @get()

  get: ->
    @calculated = true
    @output()

  callbackGet:->
    res = @callOptionFunct("get")
    @revalidated()
    res

  set: (val)->
    @setAndCheckChanges(val)
    
  callbackSet: (val)->
    @callOptionFunct("set",val)
    this

  setAndCheckChanges: (val)->
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
      @_invalidateNotice()
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
      
  callOptionFunct: (funct, args...) ->
    if typeof funct == 'string'
      funct = @property.options[funct]
    if typeof funct.overrided == 'function'
      args.push (args...) => 
        @callOptionFunct funct.overrided, args...
    funct.apply(@obj, args)

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
    @callChangedFunctions(old)
    if typeof @obj.emitEvent == 'function'
      @obj.emitEvent(@updateEventName, [old])
      @obj.emitEvent(@changeEventName, [old])
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

  @compose = (prop)->
    unless prop.instanceType?
      prop.instanceType = class extends PropertyInstance

    if typeof prop.options.get == 'function'
      prop.instanceType::get = @::callbackGet

    if typeof prop.options.set == 'function'
      prop.instanceType::set = @::callbackSet
    else
      prop.instanceType::set = @::setAndCheckChanges

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
