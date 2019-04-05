Binder = require('../Binder')

# todo: dont use Invalidator
class PropertyWatcher extends Binder

  constructor: (options)->
    super()
    @invalidateCallback = => @invalidate()
    @updateCallback = (old)=> @update(old)
    if options?
      @loadOptions(options)
    unless options?.initByLoader and options.loader?
      @init()

  loadOptions: (options)->
    @scope = options.scope
    if options.loaderAsScope and options.loader?
      @scope = options.loader
    @property = options.property
    @callback = options.callback
    @autoBind = options.autoBind

  init: ->
    if @autoBind
      @bind()

  getProperty: ->
    if typeof @property == "string"
      @property = @scope.getPropertyInstance(@property)
    @property

  canBind: ->
    @getProperty()?

  doBind: ->
    @update()
    @getProperty().on 'invalidated', @invalidateCallback
    @getProperty().on 'updated', @updateCallback

  doUnbind: ->
    @getProperty().off 'invalidated', @invalidateCallback
    @getProperty().off 'updated', @updateCallback

  getRef: ->
    if typeof @property == "string"
      {property:@property, target:@scope, callback:@callback}
    else
      {property:@property.property.name, target:@property.obj, callback:@callback}

  invalidate: ->
    @getProperty().get()

  update: (old)->
    value = @getProperty().get()
    @handleChange(value, old)

  handleChange: (value, old)->
    @callback.call(@scope, old)

