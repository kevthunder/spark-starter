assert = require('chai').assert
ComposedProperty = require('../lib/ComposedProperty')
Property = require('../lib/Property')
EventEmitter = require("wolfy87-eventemitter")

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


  it 'returns a value composed(and) of many values', ->
    prop = new ComposedProperty(new Property('prop',{
      composed: true
      members: [true,true]
    }),{});

    res = prop.get()
    assert.isTrue res

    prop.members.push(false)

    res = prop.get()
    assert.isFalse res

  it 'returns a value composed(or) of many values', ->
    prop = new ComposedProperty(new Property('prop',{
      composed: true
      members: [false,false]
      default: false
    }),{});

    res = prop.get()
    assert.isFalse res

    prop.members.push(true)

    res = prop.get()
    assert.isTrue res

  it 'returns a value composed of many functions', ->
    fnTrue = ->
      true
    fnTrue2 = ->
      true
    fnFalse = ->
      false
    prop = new ComposedProperty(new Property('prop',{
      composed: true
      members: [fnTrue,fnTrue2]
    }),{});

    res = prop.get()
    assert.isTrue res

    prop.members.push(fnFalse)

    res = prop.get()
    assert.isFalse res


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
    prop = new ComposedProperty(new Property('prop',{
      composed: true
      members: []
    }),{});

    prop.members.addPropertyRef('prop1',remote)
    prop.members.addPropertyRef('prop2',remote)

    res = prop.get()
    assert.isTrue res, 'result'

    prop.members.addPropertyRef('prop3',remote)

    res = prop.get()
    assert.isFalse res, 'added property'

    prop.members.removePropertyRef('prop3',remote)

    res = prop.get()
    assert.isTrue res, 'removed property'

  it 'invalidate the result when adding a member', ->
    prop = new ComposedProperty(new Property('prop',{
      composed: true
      members: [true,true]
    }),{});

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
      default: true
    }).bind(remote)
    new Property('prop2',{
      default: true
    }).bind(remote)
    new Property('prop3',{
      default: false
    }).bind(remote)
    prop = new ComposedProperty(new Property('prop',{
      composed: true
      members: []
    }),{});

    prop.members.addPropertyRef('prop1',remote)
    prop.members.addPropertyRef('prop2',remote)

    assert.isFalse prop.calculated, 'initial calculated value'
    res = prop.get()
    assert.isTrue prop.calculated, 'calculated value after get'
    assert.equal prop.invalidator.unknowns.length, 0, 'unknowns before invalidation'
    remote.invalidateProp2()
    assert.isAbove prop.invalidator.unknowns.length, 0, 'unknowns after invalidation'