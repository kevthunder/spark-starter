assert = require('chai').assert
PropertyInstance = require('../lib/PropertyInstance')
Property = require('../lib/Property')
Invalidator = require('../lib/Invalidator')

describe 'PropertyInstance', ->
  
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
    
  it 'should re-calcul immediately if there is a listener on the change event', ->
    callcount = 0
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        callcount += 1
        3
      immediate: true
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
        assert.equal evt, 'testChanged'
      removeListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
      test: 4
    }
    prop = new PropertyInstance(new Property('prop',{
      calcul: (invalidated)->
        invalidated.prop('test',emitter)
    }),{});
    
    prop.get()
    assert.instanceOf(prop.invalidator,Invalidator)
  
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
    
  