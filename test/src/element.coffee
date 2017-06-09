assert = require('chai').assert
Element = require('../lib/Element')

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
    assert.equal obj.prop, 7
    obj.setProp(11)
    assert.equal obj.prop, 11
    
    
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
    
  it 'get ready to emit an event when a property is invalidated by an event', ->
    lastValue = 0
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
          @callcount = 0
          @added = 0
          @calculed = 0
        getListeners: -> 
          [{}]
        addListener: (evt, listener) ->
          @added += 1
        @properties
          prop: 
            calcul: (invalidated)->
              invalidated.event('testChanged',emitter)
              @calculed += 1
              lastValue += 1
        emitEvent: (event,params)->
          assert.equal event, 'propChanged'
          assert.equal params[0], lastValue-1
          @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.added, 0
    assert.equal obj.calculed, 0
    obj.addListener('propChanged',->)
    assert.equal obj.added, 1, 'listened added'
    assert.equal obj.calculed, 1, 'calculed'
    assert.equal obj.callcount, 0
    emitter.emit()
    assert.equal obj.callcount, 1, 'event emmited'
    
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
    res = obj.destroyProperties()
    assert.equal calls, 1
    
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
  
  