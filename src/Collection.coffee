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
    @_addedFunctions = {}
  changed: ->
  
  get: (i)->
    @_array[i]
  set: (i, val)->
    if @_array[i] != val
      old = @toArray()
      @_array[i] = val
      @changed(old)
    val
  add: (val)->
    unless @_array.includes(val)
      @push(val)
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
    
  @readFunctions = ['every','find','findIndex','forEach','includes','indexOf','join','lastIndexOf','map','reduce','reduceRight','some','toString']
  @readListFunctions = ['concat','filter','slice']
  @writefunctions = ['pop','push','reverse','shift','sort','splice','unshift']
  
  @readFunctions.forEach (funct)=>
    @prototype[funct] = 
      (arg...)->
        @_array[funct](arg...)
        
  @readListFunctions.forEach (funct)=>
    @prototype[funct] = 
      (arg...)->
        @copy(@_array[funct](arg...))
        
  @writefunctions.forEach (funct)=>
    @prototype[funct] = (arg...)->
      old = @toArray()
      res = @_array[funct](arg...)
      @changed(old)
      res
  
  addFunctions: (fn)->
    if typeof fn == 'object'
      Object.assign(@_addedFunctions, fn)
      Object.assign(this, fn)
      
  copy: (arr) ->
    unless arr?
      arr = @toArray
    coll = new this.constructor(arr)
    coll.addFunctions(@_addedFunctions)
    coll
  
  equals: (arr) -> 
    (@count() == if tyepeof arr.count == 'function' then arr.count() else arr.length) and
      @every (val, i) ->
        arr[i] == val
        
  getAddedFrom: (arr) -> 
    @_array.filter (item)->
      !arr.includes(item)
  
  getRemovedFrom: (arr) -> 
    arr.filter (item)=>
      !@includes(item)
  
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