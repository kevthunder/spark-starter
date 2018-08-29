Invalidator = require('../Invalidator')
BasicProperty = require('./BasicProperty')

class ActivableProperty extends BasicProperty
  activableGet:->
    @get()

  activableGet:->
    if @isActive()
      out = @activeGet()
      if @pendingChanges
        @changed(@pendingOld)
      out
    else
      @initiated = true
      undefined

  isActive: ->
    true

  manualActive: ->
    @active

  callbackActive: ->
    invalidator = @activeInvalidator || new Invalidator(this, @obj)
    invalidator.recycle (invalidator,done)=> 
      @active = @callOptionFunct(@activeFunct, invalidator)
      done()
      if @active || invalidator.isEmpty()
        invalidator.unbind()
        @activeInvalidator = null
      else
        @invalidator = invalidator
        @activeInvalidator = invalidator
        invalidator.bind()
    @active


  activeChanged: (old)->
    @changed(old)

  activableChanged: (old)->
    if @isActive()
      @pendingChanges = false
      @pendingOld = undefined
      @activeChanged()
    else
      @pendingChanges = true
      if typeof @pendingOld == 'undefined'
        @pendingOld = old
    this

  @compose = (prop)->
    if typeof prop.options.active != "undefined"
      prop.instanceType::activeGet = prop.instanceType::get
      prop.instanceType::get = @::activableGet
      prop.instanceType::activeChanged = prop.instanceType::changed
      prop.instanceType::changed = @::activableChanged
      if typeof prop.options.active == "boolean"
        prop.instanceType::active = prop.options.active
        prop.instanceType::isActive = @::manualActive
      else if typeof prop.options.active == 'function'
        prop.instanceType::activeFunct = prop.options.active
        prop.instanceType::isActive = @::callbackActive



