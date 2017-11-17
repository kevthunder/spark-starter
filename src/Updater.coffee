class Updater
  constructor: () ->
    @callbacks = []
  update: ->
    @callbacks.slice().forEach (callback)->
      callback()
  addCallback: (callback)->
    unless @callbacks.includes(callback)
      @callbacks.push(callback)
  removeCallback: (callback)->
    index = @callbacks.indexOf(callback)
    if index != -1
      @callbacks.splice(index,1)
  getBinder: ->
    new Updater.Binder(this)
  
class Updater.Binder
  constructor: (@target) ->
    @binded = false
  bind: ->
    if !@binded and @callback?
      @target.addCallback(@callback)
    @binded = true
  unbind: ->
    if @binded and @callback?
      @target.removeCallback(@callback)
    @binded = false
