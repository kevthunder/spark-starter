Mixable = require('../Mixable')
EventEmitter = require('../EventEmitter')
Loader = require('../Loader')
PropertyWatcher = require('../Invalidated/PropertyWatcher')
Referred = require('../Referred')

class BasicProperty extends Mixable
  @extend EventEmitter
  constructor: (@property, @obj) ->
    super()

  init: ->
    @value = @ingest(@default)
    @calculated = false
    @initiated = false

    preload = @constructor.getPreload(@obj, @property, this)
    if preload.length > 0
      Loader.loadMany(preload)

  get: ->
    @calculated = true
    unless @initiated 
      @initiated = true
      @emitEvent('updated')
    @output()

  set: (val)->
    @setAndCheckChanges(val)
    
  callbackSet: (val)->
    @callOptionFunct("set",val)
    this

  setAndCheckChanges: (val)->
    val = @ingest(val)
    @revalidated()
    if @checkChanges(val, @value)
      old = @value
      @value = val
      @manual = true
      @changed(old)
    this

  checkChanges: (val,old)->
    val != old

  destroy: ->
      
  callOptionFunct: (funct, args...) ->
    if typeof funct == 'string'
      funct = @property.options[funct]
    if typeof funct.overrided == 'function'
      args.push (args...) => 
        @callOptionFunct funct.overrided, args...
    funct.apply(@obj, args)

  revalidated: ->
    @calculated = true
    @initiated = true

  ingest: (val)->
    if typeof @property.options.ingest == 'function'
      val = @callOptionFunct("ingest", val)
    else
      val
  
  output: ->
    if typeof @property.options.output == 'function'
      @callOptionFunct("output", @value)
    else
      @value
      
  changed: (old)->
    @emitEvent('updated', old)
    @emitEvent('changed', old)
    this

  @compose = (prop)->
    unless prop.instanceType?
      prop.instanceType = class extends BasicProperty

    if typeof prop.options.set == 'function'
      prop.instanceType::set = @::callbackSet
    else
      prop.instanceType::set = @::setAndCheckChanges

    prop.instanceType::default = prop.options.default

  @bind = (target, prop)->
    maj = prop.name.charAt(0).toUpperCase() + prop.name.slice(1)
    opt = {
      configurable: true
      get: ->
        prop.getInstance(this).get()
    }
    unless prop.options.set == false
      opt.set = (val)->
        prop.getInstance(this).set(val)
    Object.defineProperty target, prop.name, opt
    target['get'+maj] = ->
      prop.getInstance(this).get()
    unless prop.options.set == false
      target['set'+maj] = (val)->
        prop.getInstance(this).set(val)
        this
    target['invalidate'+maj] = ->
        prop.getInstance(this).invalidate()
        this

    preload = @getPreload(target, prop)
    if preload.length > 0
      Mixable.Extension.makeOnce(Loader.prototype, target)
      target.preload(preload)

  @getPreload = (target, prop, instance)->
    preload = []
    if typeof prop.options.change == "function"
      toLoad = {
        type: PropertyWatcher
        loaderAsScope: true
        property: instance || prop.name
        initByLoader: true
        autoBind: true
        callback: prop.options.change
        ref: {
          prop: prop.name
          callback: prop.options.change
          context: 'change'
        }
      }
    if typeof prop.options.change?.copyWith == "function"
      toLoad = {
        type: prop.options.change
        loaderAsScope: true
        property: instance || prop.name
        initByLoader: true
        autoBind: true
        ref: {
          prop: prop.name
          type: prop.options.change
          context: 'change'
        }
      }
    if toLoad? and !target.preloaded?.find (loaded)-> Referred.compareRef(toLoad.ref, loaded.ref) and !instance || loaded.instance?
      preload.push toLoad
    preload