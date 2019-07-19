PropertyWatcher = require('./PropertyWatcher')


module.exports = class CollectionPropertyWatcher extends PropertyWatcher
  loadOptions: (options)->
    super(options)
    @onAdded = options.onAdded
    @onRemoved = options.onRemoved

  handleChange: (value, old)->
    old = value.copy(old || [])
    if typeof @callback == 'function'
      @callback.call(@scope, old)
    if typeof @onAdded == 'function'
      value.forEach (item, i)=>
        unless old.includes(item)
          @onAdded.call(@scope, item)
    if typeof @onRemoved == 'function'
      old.forEach (item, i)=>
        unless value.includes(item)
          @onRemoved.call(@scope, item)