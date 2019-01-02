Invalidator = require('../Invalidator')
BasicProperty = require('./BasicProperty')

class DynamicProperty extends BasicProperty
  
  callbackGet:->
    res = @callOptionFunct("get")
    @revalidated()
    res

  invalidate: ->
    if @calculated
      @calculated = false
      @_invalidateNotice()
    this

  _invalidateNotice: ->
    @emitEvent('invalidated')
    true
    

  @compose = (prop)->
 
    if typeof prop.options.get == 'function' || typeof prop.options.calcul == 'function'
      unless prop.instanceType?
        prop.instanceType = class extends DynamicProperty

    if typeof prop.options.get == 'function'
      prop.instanceType::get = @::callbackGet


