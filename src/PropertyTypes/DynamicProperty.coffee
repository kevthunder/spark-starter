Invalidator = require('../Invalidator')
BasicProperty = require('./BasicProperty')

class DynamicProperty extends BasicProperty
  
  
  init: ->
    super()
    @initRevalidate()

  initRevalidate: ->
    @revalidateCallback = =>
      @get()

  callbackGet:->
    res = @callOptionFunct("get")
    @revalidated()
    res

  invalidate: ->
    if @calculated || @active == false
      @calculated = false
      @_invalidateNotice()
    this

  revalidated: ->
    super()
    @revalidateUpdater()

  revalidateUpdater: ->
    if @getUpdater()?
      @getUpdater().unbind()

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
 
    if typeof prop.options.get == 'function' || typeof prop.options.calcul == 'function' || typeof prop.options.active == 'function'
      unless prop.instanceType?
        prop.instanceType = class extends DynamicProperty

    if typeof prop.options.get == 'function'
      prop.instanceType::get = @::callbackGet


