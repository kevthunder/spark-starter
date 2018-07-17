Invalidator = require('./Invalidator')
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

  unknown: ->
    if @calculated || @active == false
      @_invalidateNotice()
    this

  destroyWhithoutInvalidator: ->
    @destroy()

  destroyInvalidator: ->
    @destroyWhithoutInvalidator()
    if @invalidator?
      @invalidator.unbind()

  invalidateInvalidator: ->
    if @calculated || @active == false
      @calculated = false
      if @_invalidateNotice() && @invalidator?
        @invalidator.unbind()
    this

  @compose = (prop)->
    if typeof prop.options.calcul == 'function'
      prop.instanceType::calculFunct = prop.options.calcul
      prop.instanceType::get = @::calculatedGet
      if prop.options.calcul.length > 0
        prop.instanceType::calcul = @::invalidatedCalcul
        prop.instanceType::destroyWhithoutInvalidator = prop.instanceType::destroy
        prop.instanceType::destroy = @::destroyInvalidator
        prop.instanceType::invalidate = @::invalidateInvalidator
        prop.instanceType::unknown = @::unknown
      else
        prop.instanceType::calcul = @::callbackCalcul



