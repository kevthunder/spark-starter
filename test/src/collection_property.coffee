assert = require('chai').assert
CollectionProperty = require('../lib/CollectionProperty')
Property = require('../lib/Property')
Collection = require('../lib/Collection')

describe 'CollectionProperty', ->

  updateEvents = ['propChanged','propUpdated']
  
  it 'should not edit original value of a collection property', ->
    prop = new CollectionProperty(new Property('prop'),{});
    
    original = [1,2,3]
    prop.set(original)
    res = prop.get()
    assert.equal res.toString(), '1,2,3'
    res.push(4)
    assert.equal res.toString(), '1,2,3,4'
    assert.equal prop.get().toString(), '1,2,3,4'
    assert.equal original.toString(), '1,2,3'
    
  it 'should return collection when collection config is on', ->
    prop = new Property('prop',{
      collection: true
      default: [1,2,3]
    });
    prop = prop.getInstance({})
    
    res = prop.get()
    assert.instanceOf res, Collection
    assert.equal res.toString(), '1,2,3'
    
  it 'should not return collection when collection config is undefined', ->
    prop = new Property('prop',{
      default: 1
    });
    prop = prop.getInstance({})
    
    res = prop.get()
    assert.notInstanceOf res, Collection
    
  it 'can edit collection when no initial value', ->
    prop = new CollectionProperty(new Property('prop',{
      collection: true
    }),{});
  
    assert.equal prop.get().count(), 0
    prop.get().push(4)
    assert.equal prop.get().count(), 1
    assert.equal prop.get().toString(), '4'
    
  it 'should call change function when collection changed', ->
    callcount = 0
    prop = new CollectionProperty(new Property('prop',{
      collection: true
      default: [1,2,3]
      change: (old)->
        assert.isArray old
        callcount+=1
    }),{});
    
    res = prop.get()
    assert.equal callcount, 0
    assert.equal res.count(), 3
    res.push(4)
    assert.equal res.count(), 4
    assert.equal res.toString(), '1,2,3,4'
    assert.equal callcount, 1
    
  it 'should pass the old value of an uninitiated collection as an array', ->
    callcount = 0
    prop = new CollectionProperty(new Property('prop',{
      collection: true
      change: (old)->
        assert.isArray old
        callcount+=1
    }),{});
    
    assert.equal callcount, 0
    #assert.equal prop.get().count(), 0
    prop.set(4)
    assert.equal prop.get().count(), 1
    assert.equal prop.get().toString(), '4'
    assert.equal callcount, 1
    
  it 'should trigger change event when collection changed', ->
    emitter = {
      emitEvent: (evt,params)->
        assert.include updateEvents, evt
        @callcount += 1
      callcount: 0
    }
    prop = new CollectionProperty(new Property('prop',{
      collection: true
      default: [1,2,3]
    }),emitter);
    
    res = prop.get()
    assert.equal emitter.callcount, 0
    res.set(2,4)
    assert.equal res.toString(), '1,2,4'
    assert.equal emitter.callcount, updateEvents.length
    
  it 'can add method to a collection', ->
    prop = new CollectionProperty(new Property('prop',{
      collection: {
        test: -> 'test'
      }
      default: [1,2,3]
    }),{});
    
    res = prop.get()
    assert.instanceOf res, Collection
    assert.equal res.test(), 'test'
    
  it 'can foward method added to a collection', ->
    prop = new CollectionProperty(new Property('prop',{
      collection: {
        test: -> 'test'
      }
      default: [1,2,3]
    }),{});
    
    res = prop.get()
    assert.instanceOf res, Collection
    assert.equal res.test(), 'test'
    
    res = res.filter -> true
    assert.instanceOf res, Collection
    assert.equal res.test(), 'test'

  