Invalidator = require('spark-properties').Invalidator


module.exports = class Invalidated
  constructor: (options)->
    if options?
      @loadOptions(options)
    unless options?.initByLoader and options.loader?
      @init()

  loadOptions: (options)->
    @scope = options.scope
    if options.loaderAsScope and options.loader?
      @scope = options.loader
    @callback = options.callback

  init: ->
    @update()

  unknown:->
    @invalidator.validateUnknowns()

  invalidate: ->
    @update()

  update: ->
    unless @invalidator?
      @invalidator = new Invalidator(this, @scope)
    @invalidator.recycle()
    @handleUpdate(@invalidator)
    @invalidator.endRecycle()
    @invalidator.bind()
    this

  handleUpdate: (invalidator)->
    if @scope?
      @callback.call(@scope, invalidator)
    else
      @callback(invalidator)

  destroy: ->
    if @invalidator
      @invalidator.unbind()

