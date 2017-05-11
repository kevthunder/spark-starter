assert = require('chai').assert
EventBind = require('../lib/EventBind')

describe 'EventBind', ->
  it 'should add listener on bind', ->
    testEvent = 'test'
    testListener = -> null
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.equal evt, testEvent
        assert.equal listener, testListener
        calls += 1
    }
    
    bind = new EventBind(testEvent,emitter,testListener);
    bind.bind()
    assert.equal calls, 1
    
  it 'should add listener once', ->
    testEvent = 'test'
    testListener = -> null
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.equal evt, testEvent
        assert.equal listener, testListener
        calls += 1
    }
    
    bind = new EventBind(testEvent,emitter,testListener);
    bind.bind()
    bind.bind()
    assert.equal calls, 1
    
  it 'should remove listener on unbind', ->
    testEvent = 'test'
    testListener = -> null
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.equal evt, testEvent
        assert.equal listener, testListener
      removeListener: (evt, listener) ->
        assert.equal evt, testEvent
        assert.equal listener, testListener
        calls += 1
    }
    
    bind = new EventBind(testEvent,emitter,testListener);
    bind.bind()
    bind.unbind()
    assert.equal calls, 1