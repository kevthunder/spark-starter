assert = require('chai').assert
Property = require('../lib/Property')
Invalidator = require('../lib/Invalidator')
Updater = require('../lib/Updater')
EventEmitter = require('../lib/EventEmitter')

describe 'CalculatedProperty', ->

  propEvents = ['testInvalidated','testUpdated']
  updateEvents = ['propChanged','propUpdated']
  
  it 'should flag as not-manual calculated properties', ->
    prop = new Property('prop',{
      calcul: ->
        3
    }).getInstance({});

    res = prop.get()
    assert.equal res, 3
    assert.equal prop.manual, false


  it 'should not call calcul when using set', ->

    calls = 0
    prop = new Property('prop',{
      calcul: ->
        calls+=1
        3
    }).getInstance({});

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

  it 'can invalidate a property', ->
  
    prop = new Property('prop',{
      calcul: ->
         3
    }).getInstance({});
    
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    prop.get()
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal prop.value, 3
    assert.equal prop.calculated, false
    
  it 'can invalidate a property from an event', ->
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
    prop = new Property('prop',{
      calcul: (invalidated)->
        invalidated.event('testChanged',emitter)
        3
    }).getInstance({});
    
    assert.notExists emitter.event
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false, 'calculated initially false'
    prop.get()
    assert.exists emitter.event
    assert.equal prop.value, 3
    assert.equal prop.calculated, true, 'calculated true after get'
    emitter.emit()
    assert.notExists emitter.event
    assert.equal prop.value, 3
    assert.equal prop.calculated, false, 'calculated false after invalidation'
    
  it 'can handle indirect event target for invalidators', ->
    val = 3
    binded = false
    class Emitter
      addListener: (evt, listener) ->
        binded = true
      removeListener: (evt, listener) ->
        binded = false
    
    prop = new Property('prop',{
      calcul: (invalidated)->
        invalidated.event('testChanged',new Emitter())
        val+=1
      immediate: true
    }).getInstance({});
    
    assert.equal prop.calculated, false, 'calculated initially false'
    assert.isFalse binded
    prop.get()
    assert.equal prop.calculated, true, 'calculated true after get'
    assert.isTrue binded
    prop.invalidate()
    assert.equal prop.calculated, false, 'calculated false after invalidation'
    assert.isFalse binded, 'binded should be false after invalidation'
    prop.get()
    assert.equal prop.calculated, true, 'calculated true after get 2'
    assert.isTrue binded
    
  it 'should re-calcul only on the next get after an invalidation', ->
    callcount = 0
    prop = new Property('prop',{
      calcul: (invalidated)->
        callcount += 1
        3
    }).getInstance({});
    
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
    
  it 'should re-calcul immediately if the change option is defined', ->
    calculCalls = 0
    changeCalls = 0
    val = 3

    prop = new Property('prop',{
      calcul: (invalidated)->
        calculCalls += 1
        val
      change: (old)->
        changeCalls += 1
    }).getInstance({});
    
    assert.equal calculCalls, 1, "nb calcul calls"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.get()
    assert.equal calculCalls, 1, "nb calcul calls"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal calculCalls, 2, "nb calcul calls"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop.value, 3
    assert.equal prop.calculated, true
    val = 4
    prop.invalidate()
    assert.equal calculCalls, 3, "nb calcul calls"
    assert.equal changeCalls, 2, "nb change calls"
    assert.equal prop.value, 4
    assert.equal prop.calculated, true
    prop.get()
    assert.equal calculCalls, 3, "nb calcul calls"
    assert.equal changeCalls, 2, "nb change calls"
    assert.equal prop.value, 4
    assert.equal prop.calculated, true

  it 'keeps properties invalidators', ->
    emitter = new EventEmitter()
    prop = new Property('prop',{
      calcul: (invalidated)->
        invalidated.event('test',emitter)
    }).getInstance({});
    
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
    prop = new Property('prop',{
      calcul: (invalidated)->
        invalidated.prop('test')
    }).getInstance(emitter);
    
    res = prop.get()
    assert.equal res, 4
  
  it 'should re-calcul immediately if it invalidate indirectly an immediate property', ->
    calculSourceCalls = 0
    calcultargetCalls = 0
    changeCalls = 0
    val = 3

    source = {}
    new Property('prop',{
      calcul: (invalidated)->
        calculSourceCalls += 1
        val += 1
    }).bind(source);
    prop = source.getPropertyInstance('prop')

    middle = {}
    prop2 = new Property('prop2',{
      calcul: (invalidator)->
        invalidator.prop('prop',source)
    }).bind(middle);
    prop2 = middle.getPropertyInstance('prop2')

    target = {}
    prop3 = new Property('prop3',{
      calcul: (invalidator)->
        calcultargetCalls += 1
        invalidator.prop('prop2',middle)
      change: (old)->
        changeCalls += 1
    }).bind(target);
    prop3 = target.getPropertyInstance('prop3')

    assert.equal calculSourceCalls, 1, "nb calcul calls for source"
    assert.equal calcultargetCalls, 1, "nb calcul calls for target"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop3.value, 4
    assert.equal prop3.calculated, true
    assert.equal prop.value, 4
    assert.equal prop.calculated, true
    prop3.get()
    assert.equal calculSourceCalls, 1, "nb calcul calls for source"
    assert.equal calcultargetCalls, 1, "nb calcul calls for target"
    assert.equal changeCalls, 1, "nb change calls"
    assert.equal prop3.value, 4
    assert.equal prop3.calculated, true
    assert.equal prop.value, 4
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal calculSourceCalls, 2, "nb calcul calls for source"
    assert.equal calcultargetCalls, 2, "nb calcul calls for target"
    assert.equal changeCalls, 2, "nb change calls"
    assert.equal prop3.value, 5
    assert.equal prop3.calculated, true
    assert.equal prop.value, 5
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal calculSourceCalls, 3, "nb calcul calls for source"
    assert.equal calcultargetCalls, 3, "nb calcul calls for target"
    assert.equal changeCalls, 3, "nb change calls"
    assert.equal prop3.value, 6
    assert.equal prop3.calculated, true
    assert.equal prop.value, 6
    assert.equal prop.calculated, true
    prop3.get()
    assert.equal calculSourceCalls, 3, "nb calcul calls for source"
    assert.equal calcultargetCalls, 3, "nb calcul calls for target"
    assert.equal changeCalls, 3, "nb change calls"
    assert.equal prop3.value, 6
    assert.equal prop3.calculated, true
    assert.equal prop.value, 6
    assert.equal prop.calculated, true
  