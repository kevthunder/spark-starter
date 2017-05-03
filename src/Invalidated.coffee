InvalidationRefresher = require('./InvalidationRefresher')

class Invalidated
  constructor: (@getCallback, @invalidations) ->
    # @listeners = []
    @refreshers = []
    @subRefreshers = []
    @initiated = false
    @binded = false
    @listener = =>
      update()
        
  getVal : ->
    unless @initiated
      update()
    @lastValue
    
  update: ->
    @initiated = true
    oldval = @lastValue
    val = @lastValue = @getCallback()
    for refresher in @refreshers
      refresher.refreshed(val, oldval)
    
  getRefresher: ->
    return @addRefresher(new InvalidationRefresher(this))
  
  addRefresher: (refresher) ->
    @refreshers.push(refresher)
    @checkBind()
    refresher
  
  removeRefresher: (refresher) ->
    index = @refreshers.indexOf(refresher)
    if index != -1
      @refreshers.splice(index, 1)
    @checkBind()
    
  removeRefreshersLintedTo: (link) ->
    @refreshers = @refreshers.filter (refresher)->
      refresher.link != link
    @checkBind()
      
  checkBind: ->
    required = @bindIsRequired()
    if @binded != required
      if required
        @bind()
      else
        @unbind()
        
  bindIsRequired: ->
    @refreshers.length > 0
        
  bind: ->
    for event, target of @invalidations
      if target.getRefresher?
        @subRefreshers.push target.getRefresher.linkTo(this).refreshImmediate (target, oldtarget) ->
          if oldtarget? 
            oldtarget.removeListener(event, @listener)
          target.addListener(event, @listener)
      else
        target.addListener(event, @listener)
    @binded = true
      
  unbind: ->
    for event, target of @invalidations
      unless target.getRefresher?
        target.removeListener(event, @listener)
    for refresher in @subRefreshers
      refresher.unbind()
    @subRefreshers = []
    @binded = false
  
