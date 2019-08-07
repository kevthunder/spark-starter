assert = require('chai').assert
ComposedProperty = require('../lib/PropertyTypes/ComposedProperty')
Property = require('../lib/Property')
EventEmitter = require('../lib/EventEmitter')
Invalidator = require('../lib/Invalidator')

describe 'ComposedProperty', ->


  it 'should return collection when collection config is on', ->
    prop = new Property('prop',{
      composed: true
    });
    prop = prop.getInstance({})
    
    assert.instanceOf prop, ComposedProperty
    
  it 'should not return collection when collection config is undefined', ->
    prop = new Property('prop');
    prop = prop.getInstance({})
    
    assert.notInstanceOf prop, ComposedProperty

  it 'has null as default value', ->
    prop = new Property('prop',{
      composed: true
    }).getInstance({});

    res = prop.get()
    assert.equal res, null

  it 'returns default if no members', ->
    prop = new Property('prop',{
      composed: true
      default: 'hi'
    }).getInstance({});

    res = prop.get()
    assert.equal res, 'hi'

  it 'returns a value composed(and) of many values', ->
    prop = new Property('prop',{
      composed: true
      members: [true,true]
      default: true
    }).getInstance({});

    res = prop.get()
    assert.isTrue res

    prop.members.push(false)
    prop.members.push(true)

    res = prop.get()
    assert.isFalse res


  it 'returns a value composed(or) of many values', ->
    prop = new Property('prop',{
      composed: true
      members: [false,false]
      default: false
    }).getInstance({});

    res = prop.get()
    assert.isFalse res

    prop.members.push(true)

    res = prop.get()
    assert.isTrue res

  it 'returns a value composed of many values using a user function', ->
    prop = new Property('prop',{
      composed: (a,b)->
        a + b
      members: [1,2,3]
      default: 0
    }).getInstance({});

    res = prop.get()
    assert.equal res, 6

  it 'returns a value composed of many values using predefined function sum', ->
    prop = new Property('prop',{
      composed: 'sum'
      members: [1,2,3]
      default: 0
    }).getInstance({});

    res = prop.get()
    assert.equal res, 6

  it 'returns a value composed of many values using predefined function last', ->
    prop = new Property('prop',{
      composed: 'last'
      members: [1,2,3]
      default: 0
    }).getInstance({});

    res = prop.get()
    assert.equal res, 3

  it 'returns a value composed of many values using default function for string', ->
    prop = new Property('prop',{
      composed: true
      members: ['foo','bar','baz']
      default: ''
    }).getInstance({});

    res = prop.get()
    assert.equal res, 'baz'

  it 'use the setted value as the new base value', ->
    prop = new Property('prop',{
      composed: (a,b)->
        a + b
      members: [1,2,3]
      default: 0
    }).getInstance({});

    res = prop.get()
    assert.equal res, 6

    debugger
    prop.set(10)
    res = prop.get()
    assert.equal res, 16


  it 'use calcul as a member', ->
    prop = new Property('prop',{
      composed: 'sum'
      calcul: (invalidator)->
        assert.instanceOf invalidator, Invalidator
        @test
      members: [2,5]
      default: 0
    }).getInstance({test:8});

    assert.instanceOf prop, ComposedProperty
    res = prop.get()
    assert.equal res, 15

  it 'returns a value composed of many functions', ->
    fnTrue = ->
      true
    fnTrue2 = ->
      true
    fnFalse = ->
      false
    fnTrue3 = ->
      true
    prop = new Property('prop',{
      composed: true
      members: [fnTrue,fnTrue2]
      default: true
    }).getInstance({});

    res = prop.get()
    assert.isTrue res

    prop.members.push(fnFalse)
    prop.members.push(fnTrue3)

    res = prop.get()
    assert.isFalse res

  it 'returns a value composed of many ref value', ->
    prop = new Property('prop',{
      composed: true
      members: []
      default: true
    }).getInstance({});

    res = prop.get()
    assert.isTrue res, 'initial result'

    prop.members.addValueRef(true,'prop1')
    prop.members.addValueRef(true,'prop2')

    res = prop.get()
    assert.isTrue res, 'after added 2 true values'

    prop.members.addValueRef(false,'prop3')
    prop.members.addValueRef(false,'prop4')
    prop.members.addValueRef(true,'prop5')

    res = prop.get()
    assert.isFalse res, 'after added 2 false values'

    prop.members.removeRef('prop3')

    res = prop.get()
    assert.isFalse res, 'removed 1 false values'

    prop.members.removeRef('prop4')

    res = prop.get()
    assert.isTrue res, 'removed 2 false values'


  it 'can get a ref value', ->
    prop = new Property('prop',{
      composed: (a,b)->
        a + b
      members: []
    }).getInstance({});

    prop.members.addValueRef(2,'prop1')
    prop.members.addValueRef(3,'prop2')

    res = prop.members.getValueRef('prop1')
    assert.equal res, 2
    

  it 'can override the same value', ->
    prop = new Property('prop',{
      composed: (a,b)->
        a + b
      default: 0
    }).getInstance({});

    prop.members.setValueRef(2,'prop1')
    prop.members.setValueRef(2,'prop2')

    res = prop.get()
    assert.equal res, 4

    prop.members.setValueRef(3,'prop2')

    res = prop.get()
    assert.equal res, 5

  it 'trigger change only if the overriding value is different', ->
    calls = 0
    prop = new Property('prop',{
      composed: (a,b)->
        a + b
      default: 0
      change: ->
        calls++
    }).getInstance({});

    assert.equal calls, 1

    prop.members.setValueRef(2,'prop1')
    prop.members.setValueRef(2,'prop2')

    assert.equal calls, 3

    res = prop.get()
    assert.equal res, 4
    assert.equal calls, 3

    prop.members.setValueRef(2,'prop2')

    res = prop.get()
    assert.equal res, 4
    assert.equal calls, 3
    
    prop.members.setValueRef(3,'prop2')

    res = prop.get()
    assert.equal res, 5
    assert.equal calls, 4


  it 'returns a value composed of many ref functions', ->
    prop = new Property('prop',{
      composed: true
      members: []
      default: true
    }).getInstance({});

    res = prop.get()
    assert.isTrue res, 'initial result'

    prop.members.addFunctionRef (->true), 'prop1'
    prop.members.addFunctionRef (->true), 'prop2'

    res = prop.get()
    assert.isTrue res, 'after added 2 true values'

    prop.members.addFunctionRef (->false), 'prop3'
    prop.members.addFunctionRef (->false), 'prop4'
    prop.members.addFunctionRef (->true), 'prop5'

    res = prop.get()
    assert.isFalse res, 'after added 2 false values'

    prop.members.removeRef('prop3')

    res = prop.get()
    assert.isFalse res, 'removed 1 false values'

    prop.members.removeRef('prop4')

    res = prop.get()
    assert.isTrue res, 'removed 2 false values'


  it 'returns a value composed of many remote properties', ->
    remote = {
      addListener: (evt, listener) ->
      removeListener: (evt, listener) ->
    }
    new Property('prop1',{
      default: true
    }).bind(remote)
    new Property('prop2',{
      default: true
    }).bind(remote)
    new Property('prop3',{
      default: false
    }).bind(remote)
    prop = new Property('prop',{
      composed: true
      members: []
      default: true
    }).getInstance({});

    prop.members.addPropertyRef('prop1',remote)
    prop.members.addPropertyRef('prop2',remote)

    res = prop.get()
    assert.isTrue res, 'result'

    prop.members.addPropertyRef('prop3',remote)

    res = prop.get()
    assert.isFalse res, 'added property'

    prop.members.removeRef('prop3',remote)

    res = prop.get()
    assert.isTrue res, 'removed property'

  it 'returns a value composed of many nested remote properties', ->
    remote = {prop3:{}}
    new Property('prop1',{
      default: {
        val:1
      }
    }).bind(remote)
    nested = {}
    new Property('val',{
      default: 3
    }).bind(nested)
    new Property('prop2',{
      default: nested
    }).bind(remote)
    new Property('val',{
      default: 5
    }).bind(remote.prop3)
    prop = new Property('prop',{
      composed: 'sum'
      members: []
      default: 0
    }).getInstance({});

    prop.members.addPropertyRef('prop1.val',remote)
    prop.members.addPropertyRef('prop2.val',remote)

    res = prop.get()
    assert.equal res, 4

    prop.members.addPropertyRef('prop3.val',remote)

    res = prop.get()
    assert.equal res, 9

    prop.members.removeRef('prop3.val',remote)

    res = prop.get()
    assert.equal res, 4

  it 'invalidate the result when adding a member', ->
    prop = new Property('prop',{
      composed: true
      members: [true,true]
      default: true
    }).getInstance({});

    assert.isFalse prop.calculated
    res = prop.get()
    assert.isTrue prop.calculated
    prop.members.push(false)
    assert.isFalse prop.calculated

  it 'add a property for members in the object containing it', ->
    obj = {}
    prop = new Property('prop',{
      composed: true
    });
    prop = prop.bind(obj)

    assert.instanceOf obj.propMembers, ComposedProperty.Members

  it 'invalidate the result when a member is invalidated', ->
    remote = new EventEmitter()
    new Property('prop1',{
      get: -> true
    }).bind(remote)
    new Property('prop2',{
      get: -> true
    }).bind(remote)
    new Property('prop3',{
      get: -> false
    }).bind(remote)
    prop = new Property('prop',{
      composed: true
      members: []
      default: true
    }).getInstance({});

    prop.members.addPropertyRef('prop1',remote)
    prop.members.addPropertyRef('prop2',remote)

    assert.isFalse prop.calculated, 'initial calculated value'
    res = prop.get()
    assert.isTrue prop.calculated, 'calculated value after get'
    assert.equal prop.invalidator.unknowns.length, 0, 'unknowns before invalidation'
    remote.invalidateProp2()
    assert.isAbove prop.invalidator.unknowns.length, 0, 'unknowns after invalidation'