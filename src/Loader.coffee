Overrider = require('./Overrider')

class Loader extends Overrider
  constructor: ->
    initPreloaded()
  preloaded: []

  @overrides
    init:->
      @init.withoutLoader()
      @initPreloaded()
    destroy: ->
      @destroy.withoutLoader()
      @destroyLoaded()

  initPreloaded: ->
    defList = @preloaded
    @preloaded = []
    @load(defList)

  load: (defList)->
    toLoad = []
    loaded = defList.map (def)=>
      unless def.instance?
        def = Object.assign({loader:this},def)
        instance = Loader.load(def)
        def = Object.assign({instance:instance},def)
        if def.initByLoader and instance.init?
          toLoad.push(instance)
      def
    @preloaded = @preloaded.concat(loaded)
    toLoad.forEach (instance)->
      instance.init()

  preload: (def)->
    if !Array.isArray(def)
      def = [def]
    @preloaded = @preloaded.concat(def)
  destroyLoaded: ->
    @preloaded.forEach (def)->
      def.instance?.destroy?()
  @loadMany: (def)->
    def.map (d)=>
      @load(d)
  @load: (def)->
    new def.type(def)
  @preload: (def)->
    @prototype.preload(def)
