assert = require('chai').assert
Property = require('../lib/Property')
Invalidator = require('../lib/Invalidator')
EventEmitter = require('../lib/EventEmitter')
Updater = require('../lib/Updater')

describe 'Updated Property', ->
  it 'should not not be immediate', ->
    updater = new Updater()
    emitter = new EventEmitter()

    (new Property('bar',{
      updater: updater
      change: ->
    })).bind(emitter)

    emitter.bar
    assert.isFalse emitter._bar.isImmediate()

  it 'triggers change only after an update', ->
    updater = new Updater()
    emitter = new EventEmitter()

    changeCalls = 0
    (new Property('bar',{
      updater: updater
      change: ->
        changeCalls += 1

    })).bind(emitter)

    assert.equal changeCalls, 0, 'changeCalls initial'
    assert.equal updater.callbacks.length, 0, "nb updater callback, initial"

    emitter.bar = 'hello'
    assert.equal changeCalls, 0, 'changeCalls after set'
    assert.equal updater.callbacks.length, 1, "nb updater callback, after set"

    updater.update()
    assert.equal changeCalls, 1, 'changeCalls after update'
    assert.equal updater.callbacks.length, 0, "nb updater callback, after update"

    res = emitter.bar
    assert.equal res, 'hello'
    assert.equal changeCalls, 1, 'changeCalls after get 2'
    assert.equal updater.callbacks.length, 0, "nb updater callback, after get 2"

    emitter.bar = 'hey'
    assert.equal changeCalls, 1, 'changeCalls after set 2'
    assert.equal updater.callbacks.length, 1, "nb updater callback, after set 2"

    updater.update()
    assert.equal changeCalls, 2, 'changeCalls after update 2'
    assert.equal updater.callbacks.length, 0, "nb updater callback, after update 2"
