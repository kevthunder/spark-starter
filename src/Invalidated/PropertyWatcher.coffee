Invalidated = require('./Invalidated')

# todo: dont use Invalidator
class PropertyWatcher extends Invalidated
  loadOptions: (options)->
    @scope = options.scope
    if options.loaderAsScope and options.loader?
      @scope = options.loader
    @property = options.property
    @callback = options.callback

  handleUpdate: (invalidator)->
    old = @old
    @old = value = invalidator.prop(@property)
    @handleChange(value, old)

  handleChange: (value, old)->
    @callback.call(@scope, old)

