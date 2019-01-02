assert = require('chai').assert
Invalidator = require('../lib/Invalidator')
EventEmitter = require('../lib/EventEmitter')
Property = require('../lib/Property')

describe 'Invalidator', ->

  propEvents = ['testInvalidated','testUpdated']

  afterEach ->
    Invalidator.strict = true

  it 'can invalidate a object property', ->
    calls = 0
    prop = {
      invalidate: ->
        calls++
    }
    invalidator = new Invalidator(prop);

    assert.equal calls, 0
    invalidator.invalidate()
    assert.equal calls, 1

  it 'can invalidate a function property', ->
    calls = 0
    prop = ->
      calls++

    invalidator = new Invalidator(prop);

    assert.equal calls, 0
    invalidator.invalidate()
    assert.equal calls, 1

  it 'can invalidate through a callback', ->
    calls = 0

    invalidator = new Invalidator();
    invalidator.callback = ->
      calls++

    assert.equal calls, 0
    invalidator.invalidate()
    assert.equal calls, 1

  it 'tolerate having nothing to invalidate', ->
    invalidator = new Invalidator();

    assert.isFalse invalidator.invalid
    invalidator.invalidate()
    assert.isTrue invalidator.invalid

    invalidator.bind()
    assert.isFalse invalidator.invalid


  it 'should remove old value with invalidate', ->
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    
    assert.equal invalidated.test, 1
    invalidator.invalidate()
    assert.equal invalidated.test, null
    
  it 'should call invalidation function with invalidate', ->
    calls = 0
    invalidated = {
      invalidateTest: ->
        calls += 1
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    
    assert.equal calls, 0
    invalidator.invalidate()
    assert.equal calls, 1

  it 'should create a bind with invalidationEvent', ->
    invalidated = {
      test: 1
    }
    emitter = {on:->}
    invalidator = new Invalidator('test', invalidated);
    
    assert.equal invalidator.invalidationEvents.length, 0
    
    invalidator.event('testChanged',emitter)
    
    assert.equal invalidator.invalidationEvents.length, 1
    assert.equal invalidator.invalidationEvents[0].event, 'testChanged'
    assert.equal invalidator.invalidationEvents[0].target, emitter
    assert.equal invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback


  it 'should have a distict bind than anoter Invalidator binding the same event', ->
    invalidated = {
      test1: 1
      test2: 1
    }
    emitter = new EventEmitter();
    invalidator1 = new Invalidator('test1', invalidated);
    invalidator2 = new Invalidator('test2', invalidated);

    invalidator1.event('testChanged',emitter)
    invalidator2.event('testChanged',emitter)

    assert.equal invalidator1.invalidationEvents.length, 1
    assert.equal invalidator2.invalidationEvents.length, 1
    assert.isFalse invalidator1.invalidationEvents[0].equals(invalidator2.invalidationEvents[0])


  it 'should add listener on bind', ->
    emitter = new EventEmitter();
    invalidator = new Invalidator();

    invalidator.event('test', emitter)
    
    assert.equal emitter.getListeners('test').length, 0
    invalidator.bind()
    assert.equal emitter.getListeners('test').length, 1
    
    
  it 'should remove listener on unbind', ->
    emitter = new EventEmitter();
    invalidator = new Invalidator();

    invalidator.event('test', emitter)
    
    assert.equal emitter.getListeners('test').length, 0
    invalidator.bind()
    assert.equal emitter.getListeners('test').length, 1
    invalidator.unbind()
    assert.equal emitter.getListeners('test').length, 0

    
  it 'should create a bind with invalidatedValue', ->
    invalidated = {
      test: 1
    }
    emitter = {on:->}
    invalidator = new Invalidator('test', invalidated);
    
    assert.equal invalidator.invalidationEvents.length, 0
    
    res = invalidator.value(2,'testChanged',emitter)
    
    assert.equal res, 2
    assert.equal invalidator.invalidationEvents.length, 1
    assert.equal invalidator.invalidationEvents[0].event, 'testChanged'
    assert.equal invalidator.invalidationEvents[0].target, emitter
    assert.equal invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback
    
  it 'can test for a property instance', ->
    prop = new Property('prop',{}).getInstance({});
    invalidator = new Invalidator()
    assert.isTrue invalidator.checkPropInstance(prop)

  it 'can test for a non-property instance', ->
    invalidator = new Invalidator()
    assert.isFalse invalidator.checkPropInstance({})

  it 'can create a bind with a property', ->

    prop = new Property('prop',{
      get: ->
         3
    }).getInstance({});
    invalidedCalls = 0
    invalidator = new Invalidator ->
      invalidedCalls++
    
    assert.equal invalidator.invalidationEvents.length, 0
    
    res = invalidator.prop(prop)
    invalidator.bind()
    
    assert.equal invalidedCalls, 0
    assert.equal res, 3

    prop.changed()
    assert.equal invalidedCalls, 1

  it 'allow to get an non-dynamic property', ->
    obj = {
      test: 1
    }
    invalidator = new Invalidator(null,obj)
    res = invalidator.prop('test')

    assert.equal res, 1

  it 'throws an error when prop name is not a valid property', ->
    invalidated = {
      test: 1
    }
    emitter = {
      test: 2
    }
    invalidator = new Invalidator('test', invalidated);

    assert.throws ->
        invalidator.prop(emitter,'test')
      , 'Property must be a PropertyInstance or a string'
    
  it 'can create a bind with a property with implicit target', ->
    
    obj = {}
    new Property('test',{
      default: 3
    }).bind(obj);

    invalidedCalls = 0
    invalidator = new Invalidator ->
        invalidedCalls++
      , obj
    
    assert.equal invalidator.invalidationEvents.length, 0
    
    res = invalidator.prop('test')
    invalidator.bind()
    
    assert.equal invalidedCalls, 0
    assert.equal res, 3

    obj.test = 5
    assert.equal invalidedCalls, 1
    
  it 'can bind to a property with propPath', ->

    obj = {}
    new Property('foo',{}).bind(obj);
    obj.foo = {}
    new Property('bar',{}).bind(obj.foo);
    obj.foo.bar = 4

    invalidateCalls = 0
    invalidator = new Invalidator ->
        invalidateCalls++
      , obj
    
    res = invalidator.propPath('foo.bar')
    invalidator.bind()

    assert.equal 4, res
    assert.equal 0, invalidateCalls

    obj.getPropertyInstance('foo').changed()
    assert.equal 1, invalidateCalls

    obj.foo.getPropertyInstance('bar').changed()
    assert.equal 2, invalidateCalls

    obj.foo.bar = 5
    assert.equal 5, invalidator.propPath('foo.bar')

    obj.foo = null
    assert.isNull invalidator.propPath('foo.bar')
    
  it 'should remove old value when the listener is triggered', ->
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    res = invalidator.prop('test')
    assert.equal res, 1
    invalidator.bind()
    
    assert.equal invalidated.test, 1
    invalidator.invalidate()
    assert.equal invalidated.test, null
    
    
  it 'should reuse old bindEvent when calling recycle', ->
    emitter = new EventEmitter();
    invalidator = new Invalidator();

    invalidator.event('test', emitter)
    
    assert.equal emitter.getListeners('test').length, 0
    invalidator.bind()
    assert.equal emitter.getListeners('test').length, 1
    invalidator.recycle (invalidator)->
      assert.equal emitter.getListeners('test').length, 1
      invalidator.event('test', emitter)
      assert.equal emitter.getListeners('test').length, 1
    invalidator.bind()
    assert.equal emitter.getListeners('test').length, 1
    
    
  it 'should unbind old unused bindEvent after calling recycle', ->
    emitter = new EventEmitter();
    invalidator = new Invalidator();

    invalidator.event('test', emitter)
    
    assert.equal emitter.getListeners('test').length, 0
    invalidator.bind()
    assert.equal emitter.getListeners('test').length, 1
    invalidator.recycle (invalidator)->
      null
    assert.equal emitter.getListeners('test').length, 0
  
  
  it 'should store unknown values', ->
    obj = {}
    new Property('test',{
      default: 2
    }).bind(obj);

    invalidedCalls = 0
    invalidator = new Invalidator null, obj

    assert.equal invalidator.unknowns.length, 0, "unknowns at beginning"

    res = invalidator.prop('test')
    invalidator.bind()

    assert.equal res, 2
    assert.equal invalidator.unknowns.length, 0, "unknowns after call prop"

    obj.getPropertyInstance('test').trigger('invalidated')

    assert.equal invalidator.unknowns.length, 1, "unknowns after invalidation"
  
  it 'can be invalidated by a subfunction', ->
    invalidateCalls = 0
    fnCalls = 0
    emiter = new EventEmitter()
    invalidated = ->
      invalidateCalls++
    invalidator = new Invalidator(invalidated);


    assert.equal fnCalls, 0
    res = invalidator.funct (invalidator)->
      invalidator.event('invalidate', emiter)
      fnCalls+=1
      fnCalls

    assert.equal res, 1, 'return'
    assert.equal fnCalls, 1, 'fnCalls before'

    invalidator.bind()

    assert.equal fnCalls, 1, 'fnCalls before(2)'
    assert.equal invalidateCalls, 0, 'invalidateCalls before'
    emiter.emit('invalidate')
    assert.equal fnCalls, 1, 'fnCalls after'
    assert.equal invalidateCalls, 1, 'invalidateCalls after'

  it 'can be marked unknown by a subfunction', ->
    invalidateCalls = 0
    unknownCalls = 0
    fnCalls = 0
    emiter = new EventEmitter()
    prop =
      invalidate: ->
        invalidateCalls++
      unknown: ->
        unknownCalls++

    invalidator = new Invalidator(prop);


    assert.equal fnCalls, 0
    res = invalidator.funct (invalidator)->
      invalidator.event('invalidate', emiter)
      fnCalls+=1
      fnCalls

    assert.equal res, 1, 'return'
    assert.equal fnCalls, 1, 'fnCalls before'

    invalidator.bind()

    assert.equal fnCalls, 1, 'fnCalls before(2)'
    assert.equal unknownCalls, 0, 'unknownCalls before'
    emiter.emit('invalidate')
    assert.equal fnCalls, 1, 'fnCalls after'
    assert.equal unknownCalls, 1, 'unknownCalls after'
    assert.equal invalidateCalls, 0, 'invalidateCalls after'

  it 'can be invalidated if subfunction result change', ->
    invalidateCalls = 0
    unknownCalls = 0
    fnCalls = 0
    emiter = new EventEmitter()
    prop =
      invalidate: ->
        invalidateCalls++
      unknown: ->
        unknownCalls++

    invalidator = new Invalidator(prop);


    assert.equal fnCalls, 0
    res = invalidator.funct (invalidator)->
      invalidator.event('invalidate', emiter)
      fnCalls+=1
      fnCalls

    assert.equal res, 1, 'return'
    assert.equal fnCalls, 1, 'fnCalls before'

    invalidator.bind()

    assert.equal fnCalls, 1, 'fnCalls before(2)'
    assert.equal unknownCalls, 0, 'unknownCalls before'
    emiter.emit('invalidate')
    assert.equal fnCalls, 1, 'fnCalls after'
    assert.equal unknownCalls, 1, 'unknownCalls after'
    assert.equal invalidateCalls, 0, 'invalidateCalls after'

    invalidator.validateUnknowns()
    assert.equal fnCalls, 2, 'fnCalls after'
    assert.equal unknownCalls, 1, 'unknownCalls after'
    assert.equal invalidateCalls, 1, 'invalidateCalls after'

  it 'cannot be invalidated if subfunction result does not change', ->
    invalidateCalls = 0
    unknownCalls = 0
    fnCalls = 0
    emiter = new EventEmitter()
    prop =
      invalidate: ->
        invalidateCalls++
      unknown: ->
        unknownCalls++

    invalidator = new Invalidator(prop);


    assert.equal fnCalls, 0
    res = invalidator.funct (invalidator)->
      invalidator.event('invalidate', emiter)
      fnCalls+=1
      1

    assert.equal res, 1, 'return'
    assert.equal fnCalls, 1, 'fnCalls before'

    invalidator.bind()

    assert.equal fnCalls, 1, 'fnCalls before(2)'
    assert.equal unknownCalls, 0, 'unknownCalls before'
    emiter.emit('invalidate')
    assert.equal fnCalls, 1, 'fnCalls after'
    assert.equal unknownCalls, 1, 'unknownCalls after'
    assert.equal invalidateCalls, 0, 'invalidateCalls after'

    invalidator.validateUnknowns()
    assert.equal fnCalls, 2, 'fnCalls after'
    assert.equal unknownCalls, 1, 'unknownCalls after'
    assert.equal invalidateCalls, 0, 'invalidateCalls after'


  it 'should call unknown when there is a new unknown', ->
    obj = {}
    new Property('test',{
      default: 2
    }).bind(obj);

    unknownCalls = 0
    invalidated = 
      unknown: ->
        unknownCalls+=1
    invalidator = new Invalidator invalidated, obj

    assert.equal invalidator.unknowns.length, 0, "unknowns at beginning"
    assert.equal unknownCalls, 0, "unknownCalls at beginning"

    res = invalidator.prop('test')
    invalidator.bind()

    assert.equal res, 2
    assert.equal invalidator.unknowns.length, 0, "unknowns after call prop"
    assert.equal unknownCalls, 0, "unknownCalls after call prop"

    obj.getPropertyInstance('test').trigger('invalidated')

    assert.equal invalidator.unknowns.length, 1, "unknowns after invalidation"
    assert.equal unknownCalls, 1, "unknownCalls after invalidation"
  
  it 'can validate unknowns', ->
    obj = {}
    getCalls = 0
    new Property('test',{
      get: ->
        getCalls+=1
        2
    }).bind(obj);

    invalidator = new Invalidator null, obj

    assert.equal invalidator.unknowns.length, 0, "unknowns at beginning"
    assert.equal getCalls, 0, "getCalls at beginning"

    res = invalidator.prop('test')
    invalidator.bind()

    assert.equal res, 2
    assert.equal invalidator.unknowns.length, 0, "unknowns after call prop"
    assert.equal getCalls, 1, "getCalls after call prop"

    obj.getPropertyInstance('test').trigger('invalidated')

    assert.equal invalidator.unknowns.length, 1, "unknowns after invalidation"
    assert.equal getCalls, 1, "getCalls after invalidation"

    invalidator.validateUnknowns()

    assert.equal invalidator.unknowns.length, 0, "unknowns after validating Unknowns"
    assert.equal getCalls, 2, "getCalls validating Unknowns"