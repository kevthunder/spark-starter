CalculatedProperty = require('./CalculatedProperty')
Invalidator = require('../Invalidator')
Collection = require('../Collection')

module.exports = class ComposedProperty extends CalculatedProperty
  init: ()->
    @initComposed()
    super()

  initComposed: ()->
    if @property.options.hasOwnProperty('default')
      @default = @property.options.default
    else
      @default = @value = true
    @members = new ComposedProperty.Members(@property.options.members)
    if @property.options.calcul?
      @members.unshift (prev,invalidator)=> @property.options.calcul.bind(@obj)(invalidator)
    @members.changed = (old)=> @invalidate()
    @join = if typeof @property.options.composed == 'function'
      @property.options.composed
    else if typeof @property.options.composed == 'string' and ComposedProperty.joinFunctions[@property.options.composed]?
      ComposedProperty.joinFunctions[@property.options.composed]
    else if @property.options.default == false
      ComposedProperty.joinFunctions.or
    else if @property.options.default == true
      ComposedProperty.joinFunctions.and
    else
      ComposedProperty.joinFunctions.last

  calcul: ->
    if @members.length
      unless @invalidator
        @invalidator =  new Invalidator(this, @obj)
      @invalidator.recycle (invalidator,done)=> 
        @value = @members.reduce (prev,member)=>
            val = if typeof member == 'function' 
              member(prev, @invalidator)
            else
              member
            @join(prev,val)
          , @default
        done()
        if invalidator.isEmpty()
          @invalidator = null
        else
          invalidator.bind()
    else
      @value = @default
    @revalidated()
    @value

  @compose = (prop)->
    if prop.options.composed?
      prop.instanceType = class extends ComposedProperty

  @bind = (target,prop)->
    CalculatedProperty.bind(target,prop)
    Object.defineProperty target, prop.name+'Members', {
      configurable: true
      get: ->
        prop.getInstance(this).members
    }

  @joinFunctions = {
    and: (a,b)->
      a && b
    or: (a,b)->
      a || b
    last: (a,b)->
      b
    sum: (a,b)->
      a + b
  }

class ComposedProperty.Members extends Collection
  addPropertyRef: (name,obj)->
    if @findRefIndex(name,obj) == -1
      fn = (prev,invalidator)->
        invalidator.prop(name,obj)
      fn.ref = {
        name: name
        obj: obj
      }
      @push(fn)
  addValueRef: (val,name,obj)->
    if @findRefIndex(name,obj) == -1
      fn = (prev,invalidator)->
        val
      fn.ref = {
        name: name
        obj: obj
        val: val
      }
      @push(fn)
  setValueRef: (val,name,obj)->
    i = @findRefIndex(name,obj)
    if i == -1
      @addValueRef(val,name,obj)
    else if @get(i).ref.val != val
      ref = {
        name: name
        obj: obj
        val: val
      }
      fn = (prev,invalidator)->
        val
      fn.ref = ref
      @set(i,fn)
  getValueRef: (name,obj)->
    @findByRef(name,obj).ref.val
  addFunctionRef: (fn,name,obj)->
    if @findRefIndex(name,obj) == -1
      fn.ref = {
        name: name
        obj: obj
      }
      @push(fn)
  findByRef: (name,obj)->
    @_array[@findRefIndex(name,obj)]
  findRefIndex: (name,obj)->
    @_array.findIndex (member)->
      member.ref? && member.ref.obj == obj && member.ref.name == name
  removeRef: (name,obj)->
    index = @findRefIndex(name,obj)
    if index != -1
      old = @toArray()
      @_array.splice(index, 1)
      @changed(old)
