class InvalidationRefresher
    constructor: (@invalided) ->
    linkTo: (@link) ->
      this
    refresh: (@callback) ->
      this
    refreshImmediate: (callback)->
      @refresh(callback)
      @refreshed(@invalided.getVal(), null)
      this
    refreshed: (val, oldVal) ->
      if @callback?
        @callback.call(@link, val, oldVal)
    unbind: ->
      @invalided.removeRefresher(this)