PropertyWatcher = require('./PropertyWatcher')
Invalidator = require('../Invalidator')

module.exports = class ActivablePropertyWatcher extends PropertyWatcher
  loadOptions: (options)->
    super(options)
    @active = options.active

  shouldBind: ->
    if @active?
      unless @invalidator?
        @invalidator = new Invalidator(this, @scope)
        @invalidator.callback = => @checkBind()
      @invalidator.recycle()
      active = @active(@invalidator)
      @invalidator.endRecycle()
      @invalidator.bind()
      active
    else
      true