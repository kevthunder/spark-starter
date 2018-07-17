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
  
  checkChanges: (old, ordered=true, compareFunction=null)->
    unless compareFunction?
      compareFunction = (a,b)-> a == b

    old = @copy(old)

    @count() != old.length or
      if ordered
        @some (val, i) ->
          !compareFunction(old.get(i),val)
      else
        @some (a) ->
          !old.pluck (b)->
            compareFunction(a,b)

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
  pluck: (fn) ->
    index = @_array.findIndex(fn)
    if index > -1
      old = @toArray()
      found = @_array[index]
      @_array.splice(index, 1)
      @changed(old)
      found
    else
      null
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
  


  @newSubClass: (fn,arr)->
    if typeof fn == 'object'
      SubClass = class extends this
      Object.assign(SubClass.prototype, fn)
      new SubClass(arr)
    else 
      new this(arr)
  
  copy: (arr) ->
    unless arr?
      arr = @toArray()
    coll = new this.constructor(arr)
    coll
  
  equals: (arr) -> 
    (@count() == if typeof arr.count == 'function' then arr.count() else arr.length) and
      @every (val, i) ->
        arr[i] == val
        
  getAddedFrom: (arr) -> 
    @_array.filter (item)->
      !arr.includes(item)
  
  getRemovedFrom: (arr) -> 
    arr.filter (item)=>
      !@includes(item)

Object.defineProperty Collection.prototype, 'length', {
  get: ->
    this.count()
}

if Symbol?.iterator
  Collection.prototype[Symbol.iterator] = ->
    return @_array[Symbol.iterator]()
