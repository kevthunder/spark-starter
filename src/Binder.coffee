Referred = require('./Referred')

module.exports = class Binder extends Referred
  toggleBind: (val = !@binded)->
    if val
      @bind()
    else
      @unbind()

  bind: ->
    if !@binded and @canBind()
      @doBind()
    @binded = true

  canBind: ->
    @callback? and @target?

  doBind: ->
    throw new Error('Not implemented')

  unbind: ->
    if @binded and @canBind()
      @doUnbind()
    @binded = false
    
  doUnbind: ->
    throw new Error('Not implemented')
    
  equals: (binder) -> 
    @compareRefered(binder)

  destroy: ->
    @unbind()