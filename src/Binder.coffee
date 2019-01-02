Referred = require('./Referred')

class Binder extends Referred
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