Invalidator = require('../Invalidator')
DynamicProperty = require('./DynamicProperty')
Overrider = require('../Overrider')

class UpdatedProperty extends DynamicProperty
  @extend Overrider

  @overrides
    init: ->
      @init.withoutUpdatedProperty()
      @initRevalidate()

    _invalidateNotice: ->
      res = @_invalidateNotice.withoutUpdatedProperty()
      if res
        @getUpdater().bind()
      res
    
    isImmediate: ->
      false

    changed: (old)->
      if @updating
        @pendingChanges = false
        @pendingOld = undefined
        @changed.withoutUpdatedProperty(old)
      else
        @pendingChanges = true
        if typeof @pendingOld == 'undefined'
          @pendingOld = old
        @getUpdater().bind()
      this

  initRevalidate: ->
    @revalidateCallback = =>
      @updating = true
      @get()
      @getUpdater().unbind()
      if @pendingChanges
        @changed(@pendingOld)
      @updating = false
    @revalidateCallback.owner = this

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

  @compose = (prop)->
    if prop.options.updater?
      prop.instanceType.extend(UpdatedProperty)


