class Updater
  constructor: () ->
    @callbacks = []
  update: ->
    @callbacks.forEach (callback)->
      callback()
  addCallback: (callback)->
    unless @callbacks.includes(callback)
      @callbacks.push(callback)
  removeCallback: (callback)->
    index = @callbacks.indexOf(callback)
    if index != -1
      @callbacks.splice(index)
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
  
if Spark?
  Spark.Updater = Updater
#--- Standalone ---
if module?
  module.exports = Updater
else
  unless @Spark?
    @Spark = {}
  @Spark.Updater = Updater
#--- Standalone end ---