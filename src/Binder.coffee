Referred = require('./Referred')

class Binder extends Referred
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
    @compareRefered(binder)