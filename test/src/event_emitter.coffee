assert = require('chai').assert
EventEmitter = require('../lib/EventEmitter')


describe 'EventEmitter', ->
  
  it 'can get All Events from an empty emitter', ->
    emitter = new EventEmitter()
    events = emitter.getAllEvents()
    assert.isObject events
    assert.lengthOf Object.keys(events), 0

  it 'can get an Event liteners from an empty emitter', ->
    emitter = new EventEmitter()
    listeners = emitter.getListeners('foo')
    assert.isArray listeners
    assert.lengthOf listeners, 0

  it 'can add listener', ->
    emitter = new EventEmitter()
    emitter.addListener 'foo', ->
      'test'
    listeners = emitter.getListeners('foo')
    assert.lengthOf(listeners, 1)
    events = emitter.getAllEvents()
    assert.lengthOf Object.keys(events), 1

  it 'can find that a listener exists', ->
    fn = ->
      'test'
    emitter = new EventEmitter()
    emitter.addListener 'foo', fn
    assert.isTrue emitter.hasListener('foo', fn)

  it 'can\'t find a listener that does not exists', ->
    fn = ->
      'test'
    fn2 = ->
      'test'
    emitter = new EventEmitter()
    emitter.addListener 'foo', fn
    assert.isFalse emitter.hasListener('foo', fn2)

  it 'can remove a listener', ->
    fn = ->
      'test'
    emitter = new EventEmitter()
    emitter.addListener 'foo', fn
    assert.lengthOf emitter.getListeners('foo'), 1
    emitter.removeListener 'foo', fn
    assert.lengthOf emitter.getListeners('foo'), 0

  it 'can emit event', ->
    called = 0
    fn = ->
      called += 1
    emitter = new EventEmitter()
    emitter.addListener 'foo', fn
    emitter.emitEvent('foo')
    assert.equal called, 1


  it 'insure callbacks cannot disrupt event triggering', ->
    fn1 = ->
      fn1.called += 1
      emitter.removeListener 'foo', fn1
    fn1.called = 0

    fn2 = ->
      fn2.called += 1
    fn2.called = 0

    emitter = new EventEmitter()
    emitter.addListener 'foo', fn1
    emitter.addListener 'foo', fn2
    emitter.emitEvent('foo')
    assert.equal fn1.called, 1, "fn1.called"
    assert.equal fn2.called, 1, "fn2.called"

  
  it 'can remove all listeners', ->
    fn = ->
      'test'
    emitter = new EventEmitter()
    emitter.addListener 'foo', fn
    assert.lengthOf emitter.getListeners('foo'), 1
    emitter.addListener 'bar', fn
    assert.lengthOf emitter.getListeners('bar'), 1
    emitter.removeAllListeners()
    assert.lengthOf emitter.getListeners('foo'), 0
    assert.lengthOf emitter.getListeners('bar'), 0
