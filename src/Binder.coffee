class Binder
  constructor: (@target, @callback) ->
    @binded = false
  bind: ->
    if !@binded and @callback? and @target?
      @doBind()
    @binded = true
  doBind: ->
    throw new Error('Not implemented')
  unbind: ->
    if @binded and @callback? and @target?
      @doUnbind()
    @binded = false
  doUnbind: ->
    throw new Error('Not implemented')
    
  equals: (binder) -> 
    binder.constructor == @constructor and
    binder.target      == @target      and
    @compareCallback binder.callback

  compareCallback : (callback) ->
    callback  == @callback or (
      callback.maker? and
      callback.maker == @callback.maker and
      callback.uses.length == @callback.uses.length and
      @callback.uses.every (arg,i)->
        arg == callback.uses[i]
    )