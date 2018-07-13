Invalidator = require('./Invalidator')
PropertyInstance = require('./PropertyInstance')

class CalculatedProperty extends PropertyInstance
  calculatedGet:->
    if @invalidator
      @invalidator.validateUnknowns()
    if !@calculated
      old = @value
      initiated = @initiated
      @calcul()
      if @value != old
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

  invalidatedCalcul: ->
    unless @invalidator
      @invalidator = new Invalidator(this, @obj)
    @invalidator.recycle (invalidator,done)=> 
      @value = @callOptionFunct(@calculFunct, invalidator)
      @manual = false
      done()
      if invalidator.isEmpty()
        @invalidator = null
      else
        invalidator.bind()
    @revalidated()
    @value

  destroyWhithoutInvalidator: ->
    @destroy()

  destroyInvalidator: ->
    @destroyWhithoutInvalidator()
    if @invalidator?
      @invalidator.unbind()

  @compose = (prop)->
    if typeof prop.options.calcul == 'function'
      prop.instanceType::calculFunct = prop.options.calcul
      prop.instanceType::get = @::calculatedGet
      if prop.options.calcul.length > 0
        prop.instanceType::calcul = @::invalidatedCalcul
        prop.instanceType::destroyWhithoutInvalidator = prop.instanceType::destroy
        prop.instanceType::destroy = @::destroyInvalidator
      else
        prop.instanceType::calcul = @::callbackCalcul



