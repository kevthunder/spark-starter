Invalidator = require('../Invalidator')
DynamicProperty = require('./DynamicProperty')

class CalculatedProperty extends DynamicProperty
  calculatedGet:->
    if @invalidator
      @invalidator.validateUnknowns()
    if !@calculated
      old = @value
      initiated = @initiated
      @calcul()
      if @checkChanges(@value, old)
        if initiated 
          @changed(old)
        else if typeof @obj.emitEvent == 'function'
          @obj.emitEvent(@updateEventName, [old])
    @output()

  calcul: ->
    @revalidated()
    @value

  callbackCalcul: ->
    @value = @callOptionFunct(@calculFunct)
    @manual = false
    @revalidated()
    @value

  @compose = (prop)->
    if typeof prop.options.calcul == 'function'
      prop.instanceType::calculFunct = prop.options.calcul
      prop.instanceType::get = @::calculatedGet
      unless prop.options.calcul.length > 0
        prop.instanceType::calcul = @::callbackCalcul



