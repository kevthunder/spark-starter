assert = require('chai').assert
Invalidator = require('../lib/Invalidator')

describe 'Invalidator', ->
  it 'should create a bind with invalidationEvent', ->
    invalidated = {
      test: 1
    }
    emitter = {}
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
    emitter = {}
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
    }
    invalidator = new Invalidator('test', invalidated);
    
    assert.equal invalidator.invalidationEvents.length, 0
    
    res = invalidator.prop('test',emitter)
    
    assert.equal res, 2
    assert.equal invalidator.invalidationEvents.length, 1
    assert.equal invalidator.invalidationEvents[0].event, 'testChanged'
    assert.equal invalidator.invalidationEvents[0].target, emitter
    assert.equal invalidator.invalidationEvents[0].callback, invalidator.invalidateCallback
    
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
    
  it 'should add listener on bind', ->
  
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
        assert.equal listener, invalidator.invalidateCallback
        calls += 1
    }
    res = invalidator.prop('test',emitter)
    
    
    assert.equal calls, 0
    invalidator.bind()
    assert.equal calls, 1
    
    
  it 'should remove listener on unbind', ->
  
    invalidated = {
      test: 1
    }
    invalidator = new Invalidator('test', invalidated);
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
        assert.equal listener, invalidator.invalidateCallback
      removeListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
        assert.equal listener, invalidator.invalidateCallback
        calls += 1
    }
    res = invalidator.prop('test',emitter)
    
    
    invalidator.bind()
    assert.equal calls, 0
    invalidator.unbind()
    assert.equal calls, 1
    
    
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
        assert.equal evt, 'testChanged'
        assert.equal listener, invalidator.invalidateCallback
        addCalls += 1
        @event = evt
        @listener = listener
      removeListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
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
    assert.equal addCalls, 1
    assert.equal removeCalls, 0
    invalidator.recycle (invalidator)->
      invalidator.prop('test',emitter)
    
    invalidator.bind()
    assert.equal addCalls, 1
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
        assert.equal evt, 'testChanged'
        assert.equal listener, invalidator.invalidateCallback
        addCalls += 1
        @event = evt
        @listener = listener
      removeListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
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
    assert.equal addCalls, 1
    assert.equal removeCalls, 0
    invalidator.recycle (invalidator)->
      null
    
    invalidator.bind()
    assert.equal addCalls, 1
    assert.equal removeCalls, 1
    
    assert.equal invalidated.test, 1
    emitter.emit();
    assert.equal invalidated.test, 1
  
  