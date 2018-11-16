Invalidator = require('../Invalidator')
BasicProperty = require('./BasicProperty')
Overrider = require('../Overrider')

class ActivableProperty extends BasicProperty
  @extend Overrider

  @overrides
    get:->
      if @isActive()
        out = @get.withoutActivableProperty()
        if @pendingChanges
          @triggerPendingChanges()
        out
      else
        @initiated = true
        undefined

    changed: (old)->
      if @isActive()
        @pendingChanges = false
        @pendingOld = undefined
        @changed.withoutActivableProperty(old)
      else
        @pendingChanges = true
        if typeof @pendingOld == 'undefined'
          @pendingOld = old
      this

  isActive: ->
    true

  triggerPendingChanges: ->
    if @getUpdater?()?
      @getUpdater().unbind()
    @changed(@pendingOld)

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

  @compose = (prop)->
    if typeof prop.options.active != "undefined"
      prop.instanceType.extend(ActivableProperty)
      if typeof prop.options.active == "boolean"
        prop.instanceType::active = prop.options.active
        prop.instanceType::isActive = @::manualActive
      else if typeof prop.options.active == 'function'
        prop.instanceType::activeFunct = prop.options.active
        prop.instanceType::isActive = @::callbackActive



