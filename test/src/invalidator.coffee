assert = require('chai').assert
Invalidator = require('../lib/Invalidator')
EventEmitter = require("wolfy87-eventemitter")

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

    assert.isFalse invalidator.invalidated
    invalidator.invalidate()
    assert.isTrue invalidator.invalidated

    invalidator.bind()
    assert.isFalse invalidator.invalidated


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
    
  it 'should create a bind with invalidatedProperty', ->
    invalidated = {
      test: 1
    }
    emitter = {
      test: 2
      on:->
    }
    invalidator = new Invalidator('test', invalidated);
    
    assert.equal invalidator.invalidationEvents.length, 0
    
    res = invalidator.prop('test',emitter)
    
    assert.equal res, 2
    assert.equal invalidator.invalidationEvents.length, propEvents.length
    for propEvent, i in propEvents
      assert.equal invalidator.invalidationEvents[i].event, propEvent
      assert.equal invalidator.invalidationEvents[i].target, emitter
      if invalidator.invalidationEvents[i].event == 'testUpdated'
        assert.equal invalidator.invalidationEvents[i].callback, invalidator.invalidateCallback


  it 'should throw error if a bind target is not a emitter', ->
    invalidated = {
      test: 1
    }
    nonEmitter = {
      test: 2
    }
    invalidator = new Invalidator('test', invalidated);
    
    bind = ->
      res = invalidator.prop('test',nonEmitter)

    assert.throws bind, 'No function to add event listeners was found'

  it 'should not throw error for a non-emitter when strict is false', ->
    Invalidator.strict = false

    invalidated = {
      test: 1
    }
    nonEmitter = {
      test: 2
    }
    invalidator = new Invalidator('test', invalidated);
    
    bind = ->
      res = invalidator.prop('test',nonEmitter)

    assert.doesNotThrow bind


  it 'throws an error when prop name is not a string', ->
    invalidated = {
      test: 1
    }
    emitter = {
      test: 2
    }
    invalidator = new Invalidator('test', invalidated);

    assert.throws ->
        invalidator.prop(emitter,'test')
      , 'Property name must be a string'
    
  it 'should create a bind with invalidatedProperty with implicit target', ->
    invalidated = {
      test: 1
      on:->
    }
    invalidator = new Invalidator('test', invalidated);
    
    assert.equal invalidator.invalidationEvents.length, 0
    
    res = invalidator.prop('test')
    
    assert.equal res, 1
    assert.equal invalidator.invalidationEvents.length, propEvents.length
    for propEvent, i in propEvents
      assert.equal invalidator.invalidationEvents[i].event, propEvent
      assert.equal invalidator.invalidationEvents[i].target, invalidated
      if invalidator.invalidationEvents[i].event == 'testUpdated'
        assert.equal invalidator.invalidationEvents[i].callback, invalidator.invalidateCallback
    

  it 'should add listener on bind', ->
  
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.include ['testInvalidated','testUpdated'], evt
        if evt == 'testUpdated'
          assert.equal listener, invalidator.invalidateCallback
        calls += 1
    }
    res = invalidator.prop('test',emitter)
    
    
    assert.equal calls, 0
    invalidator.bind()
    assert.equal calls, 2
    
    
  it 'should remove listener on unbind', ->
  
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.include propEvents, evt
        if evt == 'testUpdated'
          assert.equal listener, invalidator.invalidateCallback
      removeListener: (evt, listener) ->
        assert.include propEvents, evt
        if evt == 'testUpdated'
          assert.equal listener, invalidator.invalidateCallback
        calls += 1
    }
    res = invalidator.prop('test',emitter)
    
    
    invalidator.bind()
    assert.equal calls, 0
    invalidator.unbind()
    assert.equal calls, propEvents.length
    
    
  it 'should remove old value when the listener is triggered', ->
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    emitter = {
      addListener: (evt, listener) ->
        @event = evt
        @listener = listener
      removeListener: (evt, listener) ->
        @event = null
        @listener = null
      emit: ->
        if @listener?
          @listener()
    }
    res = invalidator.prop('test',emitter)
    invalidator.bind()
    
    assert.equal invalidated.test, 1
    emitter.emit();
    assert.equal invalidated.test, null
    
    
  it 'should reuse old bindEvent when calling recycle', ->
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    addCalls = 0
    removeCalls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.include propEvents, evt
        if evt == 'testUpdated'
          assert.equal listener, invalidator.invalidateCallback
        addCalls += 1
        @event = evt
        @listener = listener
      removeListener: (evt, listener) ->
        assert.include propEvents, evt
        if evt == 'testUpdated'
          assert.equal listener, invalidator.invalidateCallback
        removeCalls += 1
        @event = null
        @listener = null
      emit: ->
        if @listener?
          @listener()
    }
    res = invalidator.prop('test',emitter)
    
    assert.equal addCalls, 0
    assert.equal removeCalls, 0
    invalidator.bind()
    assert.equal addCalls, propEvents.length
    assert.equal removeCalls, 0
    invalidator.recycle (invalidator)->
      invalidator.prop('test',emitter)
    
    invalidator.bind()
    assert.equal addCalls, propEvents.length
    assert.equal removeCalls, 0
    
    assert.equal invalidated.test, 1
    emitter.emit();
    assert.equal invalidated.test, null
    
    
  it 'should unbind old unused bindEvent after calling recycle', ->
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    addCalls = 0
    removeCalls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.include propEvents, evt
        if evt == 'testUpdated'
          assert.equal listener, invalidator.invalidateCallback
        addCalls += 1
        @event = evt
        @listener = listener
      removeListener: (evt, listener) ->
        assert.include propEvents, evt
        if evt == 'testUpdated'
          assert.equal listener, invalidator.invalidateCallback
        removeCalls += 1
        @event = null
        @listener = null
      emit: ->
        if @listener?
          @listener()
    }
    res = invalidator.prop('test',emitter)
    
    assert.equal addCalls, 0
    assert.equal removeCalls, 0
    invalidator.bind()
    assert.equal addCalls, propEvents.length
    assert.equal removeCalls, 0
    invalidator.recycle (invalidator)->
      null
    
    invalidator.bind()
    assert.equal addCalls, propEvents.length
    assert.equal removeCalls, propEvents.length
    
    assert.equal invalidated.test, 1
    emitter.emit();
    assert.equal invalidated.test, 1
  
  
  it 'should store unknown values', ->
    class Source extends EventEmitter
      constructor: () ->
        @test = 2
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    source = new Source()

    assert.equal invalidator.unknowns.length, 0, "unknowns at beginning"

    res = invalidator.prop('test',source)
    invalidator.bind()

    assert.equal res, 2
    assert.equal invalidator.unknowns.length, 0, "unknowns after call prop"

    source.emit('testInvalidated')

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
    unknownCalls = 0
    class Source extends EventEmitter
      constructor: () ->
        @test = 2
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    invalidator.unknown = ->
      unknownCalls+=1
    source = new Source()

    assert.equal invalidator.unknowns.length, 0, "unknowns at beginning"
    assert.equal unknownCalls, 0, "unknownCalls at beginning"

    res = invalidator.prop('test',source)
    invalidator.bind()

    assert.equal res, 2
    assert.equal invalidator.unknowns.length, 0, "unknowns after call prop"
    assert.equal unknownCalls, 0, "unknownCalls after call prop"

    source.emit('testInvalidated')

    assert.equal invalidator.unknowns.length, 1, "unknowns after invalidation"
    assert.equal unknownCalls, 1, "unknownCalls after invalidation"
  
  it 'can validate unknowns', ->
    class Source extends EventEmitter
      constructor: () ->
        @getCalls = 0
        Object.defineProperty this, 'test', {
          get: ->
            @getCalls+=1
            2
        }
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    source = new Source()

    assert.equal invalidator.unknowns.length, 0, "unknowns at beginning"
    assert.equal source.getCalls, 0, "getCalls at beginning"

    res = invalidator.prop('test',source)
    invalidator.bind()

    assert.equal res, 2
    assert.equal invalidator.unknowns.length, 0, "unknowns after call prop"
    assert.equal source.getCalls, 1, "getCalls after call prop"

    source.emit('testInvalidated')

    assert.equal invalidator.unknowns.length, 1, "unknowns after invalidation"
    assert.equal source.getCalls, 1, "getCalls after invalidation"

    invalidator.validateUnknowns()

    assert.equal invalidator.unknowns.length, 0, "unknowns after validating Unknowns"
    assert.equal source.getCalls, 2, "getCalls validating Unknowns"