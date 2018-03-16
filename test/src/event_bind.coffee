assert = require('chai').assert
EventBind = require('../lib/EventBind')

describe 'EventBind', ->
    
  it 'can compare 2 EventBinds', ->
    testEvent = 'test'
    maker = (val)->
        callback = -> null
        callback.maker = arguments.callee
        callback.uses = Array.from(arguments)
        callback
    
    calls = 0
    emitter = {}

    bind1 = new EventBind(testEvent,emitter,maker(1))
    bind2 = new EventBind(testEvent,emitter,maker(1))
    bind3 = new EventBind(testEvent,emitter,maker(2))

    assert.isTrue bind1.equals(bind2)
    assert.isFalse bind1.equals(bind3)

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
    
  it 'should add listener on bind with addEventListener', ->
    testEvent = 'test'
    testListener = -> null
    calls = 0
    emitter = {
      addEventListener: (evt, listener) ->
        assert.equal evt, testEvent
        assert.equal listener, testListener
        calls += 1
    }
    
    bind = new EventBind(testEvent,emitter,testListener);
    bind.bind()
    assert.equal calls, 1
    
  it 'should throw error if bind fail', ->
    testEvent = 'test'
    testListener = -> null
    emitter = {
    }
    
    bind = new EventBind(testEvent,emitter,testListener);
    assert.throws bind.bind.bind(bind), 'No function to add event listeners was found'
    
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