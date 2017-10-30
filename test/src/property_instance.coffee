assert = require('chai').assert
PropertyInstance = require('../lib/PropertyInstance')
Property = require('../lib/Property')
Invalidator = require('../lib/Invalidator')
Updater = require('../lib/Updater')

describe 'PropertyInstance', ->

  propEvents = ['testInvalidated','testUpdated']
  updateEvents = ['propChanged','propUpdated']
  
  it 'should not call calcul when using set', ->

    calls = 0
    prop = new PropertyInstance(new Property('prop',{
      calcul: ->
        calls+=1
        3
    }),{});

    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.set(2)
    assert.equal prop.value, 2
    assert.equal calls, 0
    assert.equal prop.calculated, true
    res = prop.get()
    assert.equal res, 2
    assert.equal prop.value, 2
    assert.equal calls, 0
    assert.equal prop.calculated, true


  it 'should be able to invalidate a property', ->
  
    prop = new PropertyInstance(new Property('prop',{
      calcul: ->
         3
    }),{});
    
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal prop.value, 3
    assert.equal prop.calculated, false
    
  it 'should be able to invalidate a property from an event', ->
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
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        invalidated.event('testChanged',emitter)
        3
    }),{});
    
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false, 'calculated initially false'
    prop.get()
    assert.equal prop.value, 3
    assert.equal prop.calculated, true, 'calculated true after get'
    emitter.emit()
    assert.equal prop.value, 3
    assert.equal prop.calculated, false, 'calculated false after invalidation'
    
  it 'Can handle indirect event target for invalidators', ->
    val = 3
    binded = false
    class Emitter
      addListener: (evt, listener) ->
        binded = true
      removeListener: (evt, listener) ->
        binded = false
    
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        invalidated.event('testChanged',new Emitter())
        val+=1
      immediate: true
    }),{});
    
    assert.equal prop.calculated, false, 'calculated initially false'
    assert.isFalse binded
    prop.get()
    assert.equal prop.calculated, true, 'calculated true after get'
    assert.isTrue binded
    prop.invalidate()
    assert.equal prop.calculated, true, 'calculated false after invalidation'
    assert.isTrue binded, 'binded should be true after invalidation'
    
  it 'should re-calcul only on the next get after an invalidation', ->
    callcount = 0
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        callcount += 1
        3
    }),{});
    
    assert.equal callcount, 0
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal callcount, 1
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal callcount, 1
    assert.equal prop.value, 3
    assert.equal prop.calculated, false
    prop.get()
    assert.equal callcount, 2
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    
  it 'should re-calcul immediately when the option is true', ->
    callcount = 0
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        callcount += 1
        3
      immediate: true
    }),{});
    
    assert.equal callcount, 0
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal callcount, 1
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal callcount, 2
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.get()
    assert.equal callcount, 2
    assert.equal prop.value, 3
    assert.equal prop.calculated, true

  it 'can use a function to determine immediate re-calcul', ->
    callcount = 0
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        callcount += 1
        3
      immediate: ->
        true
    }),{});
    
    assert.equal callcount, 0
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal callcount, 1
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal callcount, 2
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.get()
    assert.equal callcount, 2
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    
    
  it 'should re-calcul immediately if the change option is defined', ->
    calculCalls = 0
    changeCalls = 0
    val = 3
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        calculCalls += 1
        val += 1
      change: (old)->
        changeCalls += 1
    }),{});
    
    assert.equal calculCalls, 0, "nb calcul calls"
    assert.equal changeCalls, 0, "nb change calls"
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal calculCalls, 1, "nb calcul calls"
    assert.equal changeCalls, 0, "nb change calls"
    assert.equal prop.value, 4
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal calculCalls, 2, "nb calcul calls"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop.value, 5
    assert.equal prop.calculated, true
    prop.get()
    assert.equal calculCalls, 2, "nb calcul calls"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop.value, 5
    assert.equal prop.calculated, true

  it 'should use immediate function in priority to change option being defined for immediate re-calcul', ->
    calculCalls = 0
    changeCalls = 0
    val = 3
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        calculCalls += 1
        val += 1
      change: (old)->
        changeCalls += 1
      immediate: ->
        false
    }),{});
    
    assert.equal calculCalls, 0, "nb calcul calls"
    assert.equal changeCalls, 0, "nb change calls"
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal calculCalls, 1, "nb calcul calls"
    assert.equal changeCalls, 0, "nb change calls"
    assert.equal prop.value, 4
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal calculCalls, 1, "nb calcul calls"
    assert.equal changeCalls, 0, "nb change calls"
    assert.equal prop.value, 4
    assert.equal prop.calculated, false
    prop.get()
    assert.equal calculCalls, 2, "nb calcul calls"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop.value, 5
    assert.equal prop.calculated, true

  it 'should only recalcul when the updater tells it, if it is defined', ->
    calculCalls = 0
    changeCalls = 0
    val = 3
    updater = new Updater()
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        calculCalls += 1
        val += 1
      change: (old)->
        changeCalls += 1
      updater: updater
    }),{});
    
    assert.equal calculCalls, 0, "nb calcul calls, before get"
    assert.equal changeCalls, 0, "nb change calls, before get"
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal calculCalls, 1, "nb calcul calls, after get"
    assert.equal changeCalls, 0, "nb change calls, after get"
    assert.equal prop.value, 4
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal calculCalls, 1, "nb calcul calls, after invalidate"
    assert.equal changeCalls, 0, "nb change calls, after invalidate"
    assert.equal prop.value, 4
    assert.equal prop.calculated, false
    updater.update()
    assert.equal calculCalls, 2, "nb calcul calls, after update"
    assert.equal changeCalls, 1, "nb change calls, after update"
    assert.equal prop.value, 5
    assert.equal prop.calculated, true

    
  it 'should re-calcul immediately if there is a listener on the change event', ->
    callcount = 0
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        callcount += 1
        3
    }),{
        getListeners: -> 
          [{}]
    });
    
    assert.equal callcount, 0
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal callcount, 1
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal callcount, 2
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.get()
    assert.equal callcount, 2
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    
  it 'keeps properties invalidators', ->
    emitter = {
      addListener: (evt, listener) ->
        assert.include propEvents, evt
      removeListener: (evt, listener) ->
        assert.include propEvents, evt
      test: 4
    }
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        invalidated.prop('test',emitter)
    }),{});
    
    prop.get()
    assert.instanceOf(prop.invalidator,Invalidator)
    
  it 'allow implicit target for invalidators', ->
    emitter = {
      addListener: (evt, listener) ->
        assert.include propEvents, evt
      removeListener: (evt, listener) ->
        assert.include propEvents, evt
      test: 4
    }
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        invalidated.prop('test')
    }),emitter);
    
    res = prop.get()
    assert.equal res, 4
  
  it 'should allow to alter the input value', ->
    prop = new PropertyInstance(new Property('prop',{
      ingest: (val)->
        if val == 2
          'two'
        else
          val
    }),{});
    
    prop.set(2)
    assert.equal prop.value, 'two'
    prop.set('zero')
    assert.equal prop.value, 'zero'
    
  