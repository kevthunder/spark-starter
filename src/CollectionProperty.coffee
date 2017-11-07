PropertyInstance = require('./PropertyInstance')
Collection = require('./Collection')

class CollectionProperty extends PropertyInstance
  ingest: (val)->
    if typeof @property.options.ingest == 'function'
      val = @callOptionFunct("ingest", val)
    if !val?
      []
    else if typeof val.toArray == 'function'
      val.toArray()
    else if Array.isArray(val)
      val.slice()
    else
      [val]

  output: ->
    value = @value
    if typeof @property.options.output == 'function'
      value = @callOptionFunct("output", @value)
    prop = this
    col = Collection.newSubClass(@property.options.collection, value)
    col.changed = (old)-> prop.changed(old)
    col
