assert = require('chai').assert
Element = require('../lib/Element')
Invalidator = require('../lib/Invalidator')

describe 'Element', ->
  
  it 'should get property', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          prop:
            default: 7
    obj = new TestClass();
    
    assert.equal obj.prop, 7
    assert.equal obj.getProp(), 7
    
    
  it 'should set property', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          prop: {}
    obj = new TestClass();
    
    obj.prop = 7
    assert.equal obj._prop, 7
    obj.setProp(11)
    assert.equal obj._prop, 11
    
    
  it 'should return self while using set function', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          prop: {}
    obj = new TestClass();
    
    res = obj.setProp(11)
    assert.equal obj.prop, 11
    assert.equal res, obj
    
  it 'should call change only when value differ', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            change: ->
               @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount, 1
    obj.setProp(11)
    assert.equal obj.prop, 11
    assert.equal obj.callcount, 2
    obj.setProp(11)
    assert.equal obj.prop, 11
    assert.equal obj.callcount, 2
    
  it 'should emit event when value change', ->
    
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            default: 1
        emitEvent: (event,params)->
          assert.equal event, 'propChanged'
          assert.equal params[0], 1
          @callcount += 1
    obj = new TestClass();
  
    assert.equal obj.callcount, 0
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount, 1
    
  it 'allow access to old and new value in change function', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          prop:
            default: 7
    obj = new TestClass();
    
    obj.propChanged = (old)->
      assert.equal @_prop, 11
      assert.equal old, 7
    obj.setProp(11)
    
  it 'should calcul a prop only once and on demand', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.getProp()
    assert.equal obj.callcount, 1
    obj.getProp()
    assert.equal obj.callcount, 1
    
  it 'should be able to invalidate a property', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          prop: 
            calcul: ->
               3
    obj = new TestClass();
    
    assert.equal obj._prop, undefined
    assert.equal obj.propCalculated, false
    obj.getProp()
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    obj.invalidateProp()
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, false
    
  it 'give access to an invalidator in the calcul option of a property', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: (invalidated)->
              assert.typeOf(invalidated.prop,'function')
              assert.typeOf(invalidated.value,'function')
              assert.typeOf(invalidated.event,'function')
              @callcount += 1
    obj = new TestClass();
    
    obj.getProp()
    assert.equal obj.callcount, 1
    
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
    class TestClass extends Element
        constructor: () ->
        @properties
          prop: 
            calcul: (invalidated)->
              invalidated.event('testChanged',emitter)
              3
    obj = new TestClass();
    
    assert.equal obj._prop, undefined
    assert.equal obj.propCalculated, false
    obj.getProp()
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    emitter.emit()
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, false
    
  it 'should re-calcul only on the next get after an avalidation', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               @callcount += 1
               3
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    assert.equal obj._prop, undefined
    assert.equal obj.propCalculated, false
    obj.getProp()
    assert.equal obj.callcount, 1
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    obj.invalidateProp()
    assert.equal obj.callcount, 1
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, false
    obj.getProp()
    assert.equal obj.callcount, 2
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    
  it 'should re-calcul immediately when the option is true', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               @callcount += 1
               3
            immediate: true
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    assert.equal obj._prop, undefined
    assert.equal obj.propCalculated, false
    obj.getProp()
    assert.equal obj.callcount, 1
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    obj.invalidateProp()
    assert.equal obj.callcount, 2
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    obj.getProp()
    assert.equal obj.callcount, 2
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    
  it 'should re-calcul immediately if there is a listener on the change event', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               @callcount += 1
               3
        getListeners: -> 
          [{}]
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    assert.equal obj._prop, undefined
    assert.equal obj.propCalculated, false
    obj.getProp()
    assert.equal obj.callcount, 1
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    obj.invalidateProp()
    assert.equal obj.callcount, 2
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    obj.getProp()
    assert.equal obj.callcount, 2
    assert.equal obj._prop, 3
    assert.equal obj.propCalculated, true
    
  it 'should emit event when a property is invalidated and is changed', ->
    lastValue = 0
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               lastValue += 1
        getListeners: -> 
          [{}]
        emitEvent: (event,params)->
          assert.equal event, 'propChanged'
          assert.equal params[0], lastValue-1
          @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.getProp()
    assert.equal obj.callcount, 0
    obj.invalidateProp()
    assert.equal obj.callcount, 1
    
  it 'should not emit event when a property is invalidated and is not changed', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               5
        getListeners: -> 
          [{}]
        emitEvent: (event,params)->
          assert.equal event, 'propChanged'
          assert.equal params[0], lastValue-1
          @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.getProp()
    assert.equal obj.callcount, 0
    obj.invalidateProp()
    assert.equal obj.callcount, 0
    
  it 'keeps properties invalidators', ->
    emitter = {
      addListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
      removeListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
      test: 4
    }
    class TestClass extends Element
        constructor: () ->
        @properties
          prop: 
            calcul: (invalidated)->
              invalidated.prop('test',emitter)
    obj = new TestClass();
    
    obj.getProp()
    assert.instanceOf(obj.propInvalidator,Invalidator)
  
  it 'have a method to unbind all invalidators', ->
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
      removeListener: (evt, listener) ->
        assert.equal evt, 'testChanged'
        calls += 1
      test: 4
    }
    class TestClass extends Element
        constructor: () ->
        @properties
          prop: 
            calcul: (invalidated)->
              invalidated.prop('test',emitter)
    obj = new TestClass();
    
    obj.getProp()
    res = obj.unbindInvalidators()
    assert.equal res, 1
    assert.equal calls, 1
    
  it 'should allow to alter the input value', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          prop: 
            ingest: (val)->
              if val == 2
                'two'
              else
                val
    obj = new TestClass();
    
    obj.prop = 2
    assert.equal obj._prop, 'two'
    obj.prop = 'zero'
    assert.equal obj._prop, 'zero'
    
  it 'return self when calling tap', ->
    class TestClass extends Element
    obj = new TestClass();
    
    res = obj.tap ->
      @test = 1
    
    assert.equal obj.test, 1
    assert.equal res, obj
    
  it 'return the same function when calling "callback" twice', ->
    class TestClass extends Element
      doSomething: ->
        @test = 1
    obj = new TestClass();
    
    assert.equal obj.callback('doSomething'), obj.callback('doSomething')
    
    obj.callback('doSomething')()
    assert.equal obj.test, 1
  
  