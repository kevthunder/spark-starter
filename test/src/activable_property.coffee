assert = require('chai').assert
Property = require('../lib/Property')
Invalidator = require('../lib/Invalidator')
EventEmitter = require('../lib/EventEmitter')

describe 'Activable Property', ->
  it 'should not call calcul when not active', ->
    calls = 0

    obj = {};
    prop = (new Property('prop',{
      active: false
      calcul: ->
        calls+=1
        3
    })).bind(obj)

    assert.equal calls, 0
    assert.equal obj.getPropertyInstance('prop').calculated, false
    res = obj.prop
    assert.isUndefined res
    assert.equal calls, 0
    assert.equal obj.getPropertyInstance('prop').calculated, false

  it 'should not call change when not active', ->
    emitter = new EventEmitter()

    calculCalls = 0
    changeCalls = 0
    (new Property('foo',{
      default: null
    })).bind(emitter)
    (new Property('bar',{
      default: 'bar?'
    })).bind(emitter)
    (new Property('foobar',{
      active: (invalidator)->
        invalidator.prop('foo')?
      calcul: (invalidator)->
        calculCalls += 1
        invalidator.prop('foo') + invalidator.prop('bar')
      change: ->
        changeCalls += 1
    })).bind(emitter)

    assert.equal calculCalls, 0, 'calculCalls initial'
    assert.equal changeCalls, 0, 'changeCalls initial'
    res = emitter.foobar
    assert.isUndefined res
    assert.equal calculCalls, 0, 'calculCalls after get'
    assert.equal changeCalls, 0, 'changeCalls after get'
    emitter.bar = 'bar'
    assert.equal calculCalls, 0, 'calculCalls after change bar'
    assert.equal changeCalls, 0, 'changeCalls after change bar'
    res = emitter.foobar
    assert.isUndefined res
    assert.equal calculCalls, 0, 'calculCalls after get 2'
    assert.equal changeCalls, 0, 'changeCalls after get 2'
    emitter.foo = 'foo'
    assert.equal calculCalls, 1, 'calculCalls after change foo'
    assert.equal changeCalls, 1, 'changeCalls after change foo'
    res = emitter.foobar
    assert.equal res, 'foobar'
    assert.equal calculCalls, 1, 'calculCalls after get 2'
    assert.equal changeCalls, 1, 'changeCalls after get 2'
    emitter.bar = 'bar!'
    assert.equal calculCalls, 2, 'calculCalls after change bar 2'
    assert.equal changeCalls, 2, 'changeCalls after change bar 2'
    res = emitter.foobar
    assert.equal res, 'foobar!'
    assert.equal calculCalls, 2, 'calculCalls after get 2'
    assert.equal changeCalls, 2, 'changeCalls after get 2'

  it 'trigger change when re-activeted', ->
    emitter = new EventEmitter()

    changeCalls = 0
    (new Property('foo',{
      default: null
    })).bind(emitter)
    (new Property('bar',{
      active: (invalidator)->
        invalidator.prop('foo')?
      change: ->
        changeCalls += 1
    })).bind(emitter)

    assert.equal changeCalls, 0, 'changeCalls initial'

    res = emitter.bar
    assert.isUndefined res
    assert.equal changeCalls, 0, 'changeCalls after get'

    emitter.bar = 'hello'
    assert.equal changeCalls, 0, 'changeCalls after set'

    emitter.foo = 'foo'
    assert.equal changeCalls, 1, 'changeCalls after change foo'

    res = emitter.bar
    assert.equal res, 'hello'
    assert.equal changeCalls, 1, 'changeCalls after get 2'

    emitter.bar = 'hey'
    assert.equal changeCalls, 2, 'changeCalls after set'
