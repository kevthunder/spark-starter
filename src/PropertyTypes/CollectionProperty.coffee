DynamicProperty = require('./DynamicProperty')
Collection = require('../Collection')
Referred = require('../Referred')
CollectionPropertyWatcher = require('../Invalidated/CollectionPropertyWatcher')

module.exports = class CollectionProperty extends DynamicProperty
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

  @getPreload = (target, prop, instance)->
    preload = []
    if typeof prop.options.change == "function" || typeof prop.options.itemAdded == 'function' || typeof prop.options.itemRemoved == 'function'
      ref = 
        prop: prop.name
        context: 'change'
      unless target.preloaded?.find (loaded)-> Referred.compareRef(ref, loaded.ref) and loaded.instance?
        preload.push
          type: CollectionPropertyWatcher
          loaderAsScope: true
          scope: target
          property: instance || prop.name
          initByLoader: true
          autoBind: true
          callback: prop.options.change
          onAdded: prop.options.itemAdded
          onRemoved: prop.options.itemRemoved
          ref: ref
    preload