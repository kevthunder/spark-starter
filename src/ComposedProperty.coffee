CalculatedProperty = require('./CalculatedProperty')
Invalidator = require('./Invalidator')
Collection = require('./Collection')

class ComposedProperty extends CalculatedProperty
  init: ()->
    super()
    @initComposed()

  initComposed: ()->
    if @property.options.hasOwnProperty('default')
      @default = @property.options.default
    else
      @default = @value = true
    @members = new ComposedProperty.Members(@property.options.members)
    @members.changed = (old)=> @invalidate()
    @join = if typeof @property.options.composed == 'function'
      @property.options.composed
    else if @property.options.default == false
      ComposedProperty.joinFunctions.or
    else 
      ComposedProperty.joinFunctions.and

  calcul: ->
    unless @invalidator
      @invalidator =  new Invalidator(this, @obj)
    @invalidator.recycle (invalidator,done)=> 
      @value = @members.reduce (prev,member)=>
          val = if typeof member == 'function' 
            member(@invalidator)
          else
            member
          @join(prev,val)
        , @default
      done()
      if invalidator.isEmpty()
        @invalidator = null
      else
        invalidator.bind()
    @revalidated()
    @value

  @compose = (prop)->
    if prop.options.composed?
      prop.instanceType = class extends ComposedProperty
      prop.instanceType::get = @::calculatedGet

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
  }

class ComposedProperty.Members extends Collection
  addPropertyRef: (name,obj)->
    if @findRefIndex(name,obj) == -1
      fn = (invalidator)->
        invalidator.prop(name,obj)
      fn.ref = {
        name: name
        obj: obj
      }
      @push(fn)
  addValueRef: (val,name,obj)->
    if @findRefIndex(name,obj) == -1
      fn = (invalidator)->
        val
      fn.ref = {
        name: name
        obj: obj
      }
      @push(fn)
  addFunctionRef: (fn,name,obj)->
    if @findRefIndex(name,obj) == -1
      fn.ref = {
        name: name
        obj: obj
      }
      @push(fn)
  findRefIndex: (name,obj)->
    @_array.findIndex (member)->
      member.ref? && member.ref.obj == obj && member.ref.name == name
  removeRef: (name,obj)->
    index = @findRefIndex(name,obj)
    if index != -1
      old = @toArray()
      @_array.splice(index, 1)
      @changed(old)
