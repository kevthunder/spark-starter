Invalidator = require('../Invalidator')
BasicProperty = require('./BasicProperty')

class DynamicProperty extends BasicProperty
  
  callbackGet:->
    res = @callOptionFunct("get")
    @revalidated()
    res

  invalidate: ->
    if @calculated || @active == false
      @calculated = false
      @_invalidateNotice()
    this

  _invalidateNotice: ->
    if @isImmediate()
      @get()
      false
    else 
      if typeof @obj.emitEvent == 'function'
        @obj.emitEvent(@invalidateEventName)
      true
    
  isImmediate: ->
    @property.options.immediate != false and
    (
      @property.options.immediate == true or
        if typeof @property.options.immediate == 'function'
          @callOptionFunct("immediate")
        else
          @hasChangedEvents() or @hasChangedFunctions()
    )

  @compose = (prop)->
 
    if typeof prop.options.get == 'function' || typeof prop.options.calcul == 'function' || typeof prop.options.active == 'function'
      unless prop.instanceType?
        prop.instanceType = class extends DynamicProperty

    if typeof prop.options.get == 'function'
      prop.instanceType::get = @::callbackGet


