assert = require('chai').assert
Element = require('../lib/Element')
Property = require('../lib/Property')
EventEmitter = require('../lib/EventEmitter')


describe 'Element', ->
  
  invalidateEvents = ['propInvalidated']
  updateEvents = ['propChanged','propUpdated']

  it 'can extend a third class with properties', ->
    class BaseClass extends Element
      @properties
        foo: 
          default: 'hello'
    class TestClass extends Element
      @extend BaseClass
      @properties
        bar: 
          default: 'hey'
    obj = new TestClass();

    assert.equal obj.foo, 'hello'
    assert.equal obj.bar, 'hey'
    assert.instanceOf obj.getProperty("foo"), Property
    assert.instanceOf obj.getProperty("bar"), Property

  it 'can extend a nested class with properties', ->
    class BaseClass extends Element
      @properties
        foo: 
          default: 'hello'

    class SupClass extends BaseClass

    class TestClass extends Element
      @extend SupClass
      @properties
        bar: 
          default: 'hey'
    obj = new TestClass();

    assert.equal obj.foo, 'hello'
    assert.equal obj.bar, 'hey'
    assert.instanceOf obj.getProperty("foo"), Property
    assert.instanceOf obj.getProperty("bar"), Property

  it 'can extend a third class with merged properties', ->
    class BaseClass extends Element
      constructor: () ->
        super()
        @bar = 'bye'
      @properties
        foo: 
          default: 'hello'
        bar: 
          default: 'adios'


    class Test1Class extends Element
      constructor: () ->
        super()
        @bar = 'see you'
      @extend BaseClass
      @properties
        foo: 
          calcul: -> 'hey'


    class Test2Class extends Element
      @extend BaseClass
      @properties
        foo: 
          default: 'hi'
          

    class Test3Class extends Test1Class
      @extend BaseClass

    assert.equal (new BaseClass()).foo, 'hello'
    assert.equal (new Test1Class()).foo, 'hey'
    assert.equal (new Test2Class()).foo, 'hi'
    assert.equal (new Test3Class()).foo, 'hey'

    assert.equal (new BaseClass()).bar, 'bye'
    assert.equal (new Test1Class()).bar, 'see you'
    assert.equal (new Test2Class()).bar, 'adios'
    assert.equal (new Test3Class()).bar, 'see you'
    
  it 'allow access to old and new value in change function', ->
    class TestClass extends Element
        constructor: () ->
          super()
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
        init: () ->
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
          super()
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
    
  it 'should not emit change event when a property is invalidated and is not changed', ->
    class TestClass extends Element
        constructor: () ->
          super()
          @callcount = 0
        @properties
          prop: 
            calcul: ->
               5
        getListeners: -> 
          [{}]
        emitEvent: (event,params)->
          if event == 'propChanged'
            assert.equal params[0], lastValue-1
            @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.getProp()
    assert.equal obj.callcount, 0
    obj.invalidateProp()
    assert.equal obj.callcount, 0
    
  it 'have a method to unbind all invalidators', ->
    emitter = new EventEmitter()
    class TestClass extends Element
        @properties
          prop1: 
            calcul: (invalidated)->
              invalidated.event('test',emitter)
          prop2: 
            calcul: (invalidated)->
              invalidated.event('test',emitter)
    obj = new TestClass();
    
    obj.prop1
    assert.equal emitter.getListeners('test').length, 1
    obj.prop2
    assert.equal emitter.getListeners('test').length, 2
    res = obj.destroyProperties()
    assert.equal emitter.getListeners('test').length, 0
    
  it 'can mass assign properties', ->
    class TestClass extends Element
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


  it 'can get all manually setted properties', ->
    class TestClass extends Element
        @properties
          a:
            default: 0
          b:
            default: 0
          d:
            calcul: ->
              4

    obj = new TestClass();
    assert.deepEqual obj.getManualDataProperties(), {}, 'initial'

    obj.a = 1
    obj.b = 2
    assert.deepEqual obj.getManualDataProperties(), {a:1,b:2}, 'after assign'

    assert.equal obj.d, 4
    assert.deepEqual obj.getManualDataProperties(), {a:1,b:2}, 'after cacul'

    obj.d = 5
    assert.deepEqual obj.getManualDataProperties(), {a:1,b:2,d:5}, 'after assign over caculated value'

    obj.invalidateD()
    assert.deepEqual obj.getManualDataProperties(), {a:1,b:2}, 'after invalidate'


    
  it 'can mass assign properties with whitelist', ->
    class TestClass extends Element
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


  it 'can forward argument with callback', ->
    calls = 0
    class TestClass extends Element
      doSomething: (arg1,arg2,arg3)->
        assert.equal arg1, 3
        assert.equal arg2, 'test'
        assert.deepEqual arg3, {hi:5}
        calls+=1
    obj = new TestClass();
    
    
    obj.callback('doSomething')(3,'test',{hi:5})
    assert.equal calls, 1
  
  it 'keeps old options when overriding a property', ->
    class TestClass extends Element
      init: () ->
        @callcount = 0
      @properties
        prop: 
          change: ->
            @callcount += 1
             
    TestClass.properties
      prop: 
          default: 10
          
    obj = new TestClass();
         
    assert.equal obj.callcount, 1
    assert.equal obj.prop, 10
    assert.equal obj.callcount, 1
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount, 2
    
  it 'allows to call an overrided function of a property', ->
    class TestClass extends Element
      init: () ->
        @callcount1 = 0
        @callcount2 = 0
      @properties
        prop: 
          change: (old) ->
             @callcount1 += 1
             
    TestClass.properties
      prop: 
        change: (old, overrided) ->
          @callcount2 += 1
          
    obj = new TestClass();
    
    assert.equal obj.callcount1, 1
    assert.equal obj.callcount2, 1
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount1, 2, "original callcount"
    assert.equal obj.callcount2, 2, "new callcount"
    
  it 'return new Property when calling getProperty after an override', ->
    class TestClass extends Element
    
    oldProp = TestClass.property "prop", {default:1}
    newProp = TestClass.property "prop", {default:2}
    
    obj = new TestClass();
    
    assert.equal obj.getProperty("prop"), newProp
    
            
  it 'should propagate invalidation', ->
    val = 1
    class TestClass extends Element
      @include EventEmitter.prototype
      constructor: (@source) ->
        super()
        @calculCount = 0
      @properties
        source: {}
        forwarded:
          calcul: (invalidator)->
            @calculCount++
            if invalidator.prop('source')?
              invalidator.prop('forwarded',@source)
            else
              val

    lvl1 = new TestClass()
    lvl2 = new TestClass(lvl1)
    lvl3 = new TestClass(lvl2)

    assert.equal lvl1.calculCount, 0, "lvl1 calculCount beginning"
    assert.equal lvl2.calculCount, 0, "lvl2 calculCount beginning"
    assert.equal lvl3.calculCount, 0, "lvl3 calculCount beginning"

    res = lvl3.getForwarded()

    assert.equal res, 1, "result for get"
    assert.equal lvl1.calculCount, 1, "lvl1 calculCount after get"
    assert.equal lvl2.calculCount, 1, "lvl2 calculCount after get"
    assert.equal lvl3.calculCount, 1, "lvl3 calculCount after get"

    val+=1
    lvl1.invalidateForwarded()

    assert.equal lvl1.calculCount, 1, "lvl1 calculCount after invalidate"
    assert.equal lvl2.calculCount, 1, "lvl2 calculCount after invalidate"
    assert.equal lvl3.calculCount, 1, "lvl3 calculCount after invalidate"

    res = lvl3.getForwarded()

    assert.equal res, 2, "result for get 2"
    assert.equal lvl1.calculCount, 2, "lvl1 calculCount after get 2"
    assert.equal lvl2.calculCount, 2, "lvl2 calculCount after get 2"
    assert.equal lvl3.calculCount, 2, "lvl3 calculCount after get 2"

  it 'should not recalculate if no change while propagating', ->
    val = 1
    class TestClass extends Element
      @include EventEmitter.prototype
      constructor: (@source) ->
        super()
        @calculCount = 0
      @properties
        source: {}
        forwarded:
          calcul: (invalidator)->
            @calculCount++
            if invalidator.prop('source')?
              invalidator.prop('forwarded',@source)
            else
              val

    lvl1 = new TestClass()
    lvl2 = new TestClass(lvl1)
    lvl3 = new TestClass(lvl2)

    assert.equal lvl1.calculCount, 0, "lvl1 calculCount beginning"
    assert.equal lvl2.calculCount, 0, "lvl2 calculCount beginning"
    assert.equal lvl3.calculCount, 0, "lvl3 calculCount beginning"

    res = lvl3.getForwarded()

    assert.equal res, 1, "result for get"
    assert.equal lvl1.calculCount, 1, "lvl1 calculCount after get"
    assert.equal lvl2.calculCount, 1, "lvl2 calculCount after get"
    assert.equal lvl3.calculCount, 1, "lvl3 calculCount after get"

    lvl1.invalidateForwarded()

    assert.equal lvl1.calculCount, 1, "lvl1 calculCount after invalidate"
    assert.equal lvl2.calculCount, 1, "lvl2 calculCount after invalidate"
    assert.equal lvl3.calculCount, 1, "lvl3 calculCount after invalidate"

    lvl3.getForwarded()

    assert.equal res, 1, "result for get 2"
    assert.equal lvl1.calculCount, 2, "lvl1 calculCount after get 2"
    assert.equal lvl2.calculCount, 1, "lvl2 calculCount after get 2"
    assert.equal lvl3.calculCount, 1, "lvl3 calculCount after get 2"


