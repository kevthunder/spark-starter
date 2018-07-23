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

  checkChangedItems: (val,old)->
      if typeof @collectionOptions.compare == 'function'
        compareFunction = @collectionOptions.compare
      (new Collection(val)).checkChanges(old, @collectionOptions.ordered, compareFunction)

  output: ->
    value = @value
    if typeof @property.options.output == 'function'
      value = @callOptionFunct("output", @value)
    prop = this
    col = Collection.newSubClass(@collectionOptions, value)
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

  @defaultCollectionOptions = {
    compare: false
    ordered: true
  }

  @compose = (prop)->
    if prop.options.collection?
      prop.instanceType = class extends CollectionProperty

      prop.instanceType::collectionOptions = Object.assign {}, 
        @defaultCollectionOptions, 
        if typeof prop.options.collection == 'object'
          prop.options.collection
        else
          {}

      if prop.options.collection.compare?
        prop.instanceType::checkChanges = @::checkChangedItems