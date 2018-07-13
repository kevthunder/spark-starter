DynamicProperty = require('./DynamicProperty')
Collection = require('./Collection')

class CollectionProperty extends DynamicProperty
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

  callChangedFunctions: (old)->
    if typeof @property.options.itemAdded == 'function'
      @value.forEach (item, i)=>
        unless old.includes(item)
          @callOptionFunct("itemAdded", item, i)
    if typeof @property.options.itemRemoved == 'function'
      old.forEach (item, i)=>
        unless @value.includes(item)
          @callOptionFunct("itemRemoved", item, i)
    super(old)

  hasChangedFunctions: ()->
    super() || 
      typeof @property.options.itemAdded == 'function' || 
      typeof @property.options.itemRemoved == 'function'

  @compose = (prop)->
    if prop.options.collection?
      prop.instanceType = class extends CollectionProperty