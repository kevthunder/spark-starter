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
    assert.equal updater.callbacks.length, 0
    updater.addCallback(callback)
    assert.equal updater.callbacks[0], callback
    assert.equal updater.callbacks.length, 1
  it 'allow to remove callback', ->
    updater = new Updater()
    callback = ->
      1
    assert.equal updater.callbacks.length, 0
    updater.addCallback(callback)
    assert.equal updater.callbacks[0], callback
    assert.equal updater.callbacks.length, 1
    updater.removeCallback(callback)
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
    