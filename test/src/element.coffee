assert = require('chai').assert
Element = require('../lib/Element')

describe 'Element', ->
  
  invalidateEvents = ['propInvalidated']
  updateEvents = ['propChanged','propUpdated']

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
          assert.include updateEvents, event
          assert.equal params[0], 1
          @callcount += 1
    obj = new TestClass();
  
    assert.equal obj.callcount, 0
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount, updateEvents.length
    
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
    
  it 'should emit changed event when a property is invalidated and is changed', ->
    lastValue = 0
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               lastValue += 1
        getListeners: (event)-> 
          if event == 'propChanged'
            [{}]
          else
            []
        emitEvent: (event,params)->
          assert.include updateEvents, event
          assert.equal params[0], lastValue-1
          @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.getProp()
    assert.equal obj.callcount, 0
    obj.invalidateProp()
    assert.equal obj.callcount, updateEvents.length
    
  it 'should not calcul when a property is invalidated with update event', ->
    lastValue = 0
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            calcul: ->
              @callcount += 1
        getListeners: (event)-> 
          if event == 'propUpdated'
            [{}]
          else
            []
        emitEvent: (event,params)->
          assert.include invalidateEvents, event
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.getProp()
    assert.equal obj.callcount, 1
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
          assert.include updateEvents, event
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
    assert.equal obj.callcount, updateEvents.length, 'event emmited'
    
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
    propEvents = ['testInvalidated','testUpdated']
    calls = 0
    emitter = {
      addListener: (evt, listener) ->
        assert.include propEvents, evt
      removeListener: (evt, listener) ->
        assert.include propEvents, evt
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
    assert.equal calls, propEvents.length
    
  it 'can mass assign properties', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          a:
            default: 0
          b:
            default: 0
          c:
            default: 0
          d:
            default: 0
    obj = new TestClass();
    assert.equal obj.a, 0
    assert.equal obj.b, 0
    assert.equal obj.c, 0
    assert.equal obj.d, 0
    obj.setProperties(a:1,b:2,c:3,f:8)
    assert.equal obj.a, 1
    assert.equal obj.b, 2
    assert.equal obj.c, 3
    assert.equal obj.d, 0
    
  it 'can mass assign properties with whitelist', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          a:
            default: 0
          b:
            default: 0
          c:
            default: 0
          d:
            default: 0
    obj = new TestClass();
    assert.equal obj.a, 0
    assert.equal obj.b, 0
    assert.equal obj.c, 0
    assert.equal obj.d, 0
    obj.setProperties({a:1,b:2,c:3},{whitelist:['a','b']})
    assert.equal obj.a, 1
    assert.equal obj.b, 2
    assert.equal obj.c, 0
    assert.equal obj.d, 0
    
  it 'can mass assign properties with blacklist', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          a:
            default: 0
          b:
            default: 0
          c:
            default: 0
          d:
            default: 0
    obj = new TestClass();
    assert.equal obj.a, 0
    assert.equal obj.b, 0
    assert.equal obj.c, 0
    assert.equal obj.d, 0
    obj.setProperties({a:1,b:2,c:3},{blacklist:['c']})
    assert.equal obj.a, 1
    assert.equal obj.b, 2
    assert.equal obj.c, 0
    assert.equal obj.d, 0
  
    
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
  
  it 'keeps old options when overriding a property', ->
    class TestClass extends Element
      constructor: () ->
        @callcount = 0
      @properties
        prop: 
          change: ->
             @callcount += 1
             
    TestClass.properties
      prop: 
          default: 10
          
    obj = new TestClass();
         
    assert.equal obj.prop, 10
    assert.equal obj.callcount, 0
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount, 1
    
  it 'allows to call an overrided function of a property', ->
    class TestClass extends Element
      constructor: () ->
        @callcount1 = 0
        @callcount2 = 0
      @properties
        prop: 
          change: (old) ->
             @callcount1 += 1
             
    TestClass.properties
      prop: 
        change: (old,overrided) ->
          overrided(old)
          @callcount2 += 1
          
    obj = new TestClass();
    
    assert.equal obj.callcount1, 0
    assert.equal obj.callcount2, 0
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount1, 1, "original callcount"
    assert.equal obj.callcount2, 1, "new callcount"
    
  it 'return new Property when calling getProperty after an override', ->
    class TestClass extends Element
    
    oldProp = TestClass.property "prop", {default:1}
    newProp = TestClass.property "prop", {default:2}
    
    obj = new TestClass();
    
    assert.equal obj.getProperty("prop"), newProp
    
            