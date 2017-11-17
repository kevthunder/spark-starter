assert = require('chai').assert
Updater = require('../lib/Updater')

describe 'Updater', ->
  it 'can return a binder', ->
    updater = new Updater()
    binder = updater.getBinder()
    assert.isFunction binder.bind
    assert.isFunction binder.unbind
  it 'allow to add callback', ->
    updater = new Updater()
    callback = ->
      1
    callback2 = ->
      2
    assert.equal updater.callbacks.length, 0
    updater.addCallback(callback)
    assert.equal updater.callbacks[0], callback
    assert.equal updater.callbacks.length, 1
    updater.addCallback(callback2)
    assert.equal updater.callbacks[1], callback2
    assert.equal updater.callbacks.length, 2
  it 'allow to remove callback', ->
    updater = new Updater()
    callback = ->
      1
    callback2 = ->
      2
    assert.equal updater.callbacks.length, 0
    updater.addCallback(callback)
    assert.equal updater.callbacks[0], callback
    assert.equal updater.callbacks.length, 1
    updater.addCallback(callback2)
    assert.equal updater.callbacks[1], callback2
    assert.equal updater.callbacks.length, 2
    updater.removeCallback(callback)
    assert.equal updater.callbacks.length, 1
    updater.removeCallback(callback2)
    assert.equal updater.callbacks.length, 0
  it 'call callback on update', ->
    updater = new Updater()
    calls = 0
    callback = ->
      calls++
    updater.addCallback(callback)
    assert.equal calls, 0
    updater.update()
    assert.equal calls, 1

  it 'allow callback to remove themselves', ->
    updater = new Updater()
    callback = ->
      callback.calls++
      updater.removeCallback(callback)
    callback.calls = 0
    calls2 = 0
    callback2 = ->
      callback2.calls++
      updater.removeCallback(callback2)
    callback2.calls = 0
    assert.equal updater.callbacks.length, 0
    updater.addCallback(callback)
    updater.addCallback(callback2)
    assert.equal updater.callbacks.length, 2
    assert.equal callback.calls, 0
    assert.equal callback2.calls, 0
    updater.update()
    assert.equal callback.calls, 1
    assert.equal callback2.calls, 1
    assert.equal updater.callbacks.length, 0

describe 'Updater.Binder', ->
  it 'adds the callback with bind', ->
    updater = new Updater()
    binder = updater.getBinder()
    binder.callback = ->
      1
    assert.equal updater.callbacks.length, 0
    binder.bind()
    assert.equal updater.callbacks[0], binder.callback
    assert.equal updater.callbacks.length, 1


  it 'remove the callback with unbind', ->
    updater = new Updater()
    binder = updater.getBinder()
    binder.callback = ->
      1
    assert.equal updater.callbacks.length, 0
    binder.bind()
    assert.equal updater.callbacks[0], binder.callback
    assert.equal updater.callbacks.length, 1
    binder.unbind()
    assert.equal updater.callbacks.length, 0
    