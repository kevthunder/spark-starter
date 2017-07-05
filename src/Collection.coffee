class Collection
  constructor: (arr) ->
    if arr?
      if typeof arr.toArray == 'function'
        @_array = arr.toArray()
      else if Array.isArray(arr)
        @_array = arr
      else
        @_array = [arr]
    else
      @_array = []
  changed: ->
  
  get: (i)->
    @_array[i]
  set: (i, val)->
    if @_array[i] != val
      old = @toArray()
      @_array[i] = val
      @changed(old)
    val
  remove: (val)->
    index = @_array.indexOf(val)
    if index != -1
      old = @toArray()
      @_array.splice(index, 1)
      @changed(old)
  toArray: ->
    @_array.slice()
  count: ->
    @_array.length
    
  @readFunctions = ['concat','every','filter','find','findIndex','forEach','includes','indexOf','join','lastIndexOf','map','reduce','reduceRight','slice','some','toString']
  @writefunctions = ['pop','push','reverse','shift','sort','splice','unshift']
  
  @readFunctions.forEach (funct)=>
    @prototype[funct] = 
      (arg...)->
        @_array[funct](arg...)
        
  @writefunctions.forEach (funct)=>
    @prototype[funct] = (arg...)->
      old = @toArray()
      res = @_array[funct](arg...)
      @changed(old)
      res
      
  equals: (arr) -> 
    (@count() == if tyepeof arr.count == 'function' then arr.count() else arr.length) and
      @every (val, i) ->
        arr[i] == val
  
if Spark?
  Spark.Collection = Collection
#--- Standalone ---
if module?
  module.exports = Collection
else
  unless @Spark?
    @Spark = {}
  @Spark.Collection = Collection
#--- Standalone end ---