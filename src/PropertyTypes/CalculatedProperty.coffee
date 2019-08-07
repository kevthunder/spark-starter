Invalidator = require('../Invalidator')
DynamicProperty = require('./DynamicProperty')
Overrider = require('../Overrider')

module.exports = class CalculatedProperty extends DynamicProperty
  @extend Overrider


  @overrides
    get:->
      if @invalidator
        @invalidator.validateUnknowns()
      if !@calculated
        old = @value
        initiated = @initiated
        @calcul()
        if @checkChanges(@value, old)
          if initiated 
            @changed(old)
          else
            @emitEvent('updated', old)
        else if !initiated 
          @emitEvent('updated', old)
      @output()

  calcul: ->
    @value = @callOptionFunct(@calculFunct)
    @manual = false
    @revalidated()
    @value

  @compose = (prop)->
    if typeof prop.options.calcul == 'function' and !prop.options.composed?
      prop.instanceType::calculFunct = prop.options.calcul
      unless prop.options.calcul.length > 0
        prop.instanceType.extend(CalculatedProperty)



