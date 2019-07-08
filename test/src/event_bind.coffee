assert = require('chai').assert
EventBind = require('../lib/EventBind')

describe 'EventBind', ->
    
  it 'can compare 2 EventBinds', ->
    testEvent = 'test'
    maker = (val)->
        callback = -> null
        callback.ref = {
          maker: arguments.callee
          val: val
        }
        callback
    
    calls = 0
    emitter = {}

    bind1 = new EventBind(testEvent,emitter,maker(1))
    bind2 = new EventBind(testEvent,emitter,maker(1))
    bind3 = new EventBind(testEvent,emitter,maker(2))

    assert.isTrue bind1.equals(bind2)
    assert.isFalse bind1.equals(bind3)

  it 'can compare 2 EventBinds after a change', ->
    testEvent = 'test'
    maker = (val)->
        callback = -> null
        callback.ref = {
          maker: arguments.callee
          val: val
        }
        callback
    
    calls = 0
    emitter = {}

    bind1 = new EventBind(testEvent,emitter,maker(1))
    bind2 = new EventBind(testEvent,emitter,maker(1))

    assert.isTrue bind1.equals(bind2)
    bind2.event = 'test2'
    assert.isFalse bind1.equals(bind2)

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

  it 'can change event target', ->
    Emitter = class 
      constructor: ->
        @addCalls = 0
        @removeCalls = 0
      addListener: (evt, listener) ->
        @addCalls += 1
      removeListener: (evt, listener) ->
        @removeCalls += 1

    testListener = -> null
    emitter1 = new Emitter()
    emitter2 = new Emitter()
    bind = new EventBind('test',null,testListener);

    assert.equal emitter1.addCalls, 0
    assert.equal emitter1.removeCalls, 0
    assert.equal emitter2.addCalls, 0
    assert.equal emitter2.removeCalls, 0

    bind.bindTo(emitter1)

    assert.equal emitter1.addCalls, 1
    assert.equal emitter1.removeCalls, 0
    assert.equal emitter2.addCalls, 0
    assert.equal emitter2.removeCalls, 0

    bind.bindTo(emitter2)

    assert.equal emitter1.addCalls, 1
    assert.equal emitter1.removeCalls, 1
    assert.equal emitter2.addCalls, 1
    assert.equal emitter2.removeCalls, 0


