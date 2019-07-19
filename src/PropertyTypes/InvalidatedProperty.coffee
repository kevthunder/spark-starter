Invalidator = require('../Invalidator')
CalculatedProperty = require('./CalculatedProperty')

module.exports = class InvalidatedProperty extends CalculatedProperty
  unknown: ->
    if @calculated || @active == false
      @_invalidateNotice()
    this

  @overrides
    calcul: ->
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

    destroy: ->
      @destroy.withoutInvalidatedProperty()
      if @invalidator?
        @invalidator.unbind()

    invalidate: ->
      if @calculated || @active == false
        @calculated = false
        @_invalidateNotice()
        if !@calculated && @invalidator?
          @invalidator.unbind()
      this

  @compose = (prop)->
    if typeof prop.options.calcul == 'function' && prop.options.calcul.length > 0
      prop.instanceType.extend(InvalidatedProperty)



