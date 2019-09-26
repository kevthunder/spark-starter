assert = require('chai').assert
Element = require('../lib/Element')
Property = require('spark-properties').Property
EventEmitter = require('events').EventEmitter


describe 'Element', ->
  
  invalidateEvents = ['propInvalidated']
  updateEvents = ['propChanged','propUpdated']

  it 'can set properties from the constructor', ->
    class TestClass extends Element
      @properties
        foo: 
          default: null
        bar: 
          default: null
    
    obj = new TestClass(
      foo: 'hi'
      bar: 'hello'
    )
    
    assert.equal obj.foo, 'hi'
    assert.equal obj.bar, 'hello'


  it 'can get and set properties', ->
    class TestClass extends Element
      @properties
        a: 
          default: null
        b: 
          default: null
        c: 
          default: null
         
    obj = new TestClass() 

    obj.a = 1
    obj.bProperty.set(2)
    obj.propertiesManager.getProperty("c").set(3)
    

    assert.equal obj.a, 1
    assert.equal obj.bProperty.get(), 2
    assert.equal obj.propertiesManager.getProperty("c").get(), 3

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
    assert.instanceOf obj.fooProperty, Property
    assert.instanceOf obj.barProperty, Property

  it 'can extend a third class with properties that have watchers', ->
    class BaseClass extends Element
      @properties
        foo: 
          default: 'hello'
          change: ->

    class MiddleClass extends Element
      @properties
        baz: 
          default: 'hi'
          change: ->

    class TestClass extends BaseClass
      @extend MiddleClass
      @properties
        bar: 
          default: 'hey'
          change: ->
    obj = new TestClass();

    assert.equal obj.foo, 'hello'
    assert.equal obj.baz, 'hi'
    assert.equal obj.bar, 'hey'
    assert.instanceOf obj.fooProperty, Property
    assert.instanceOf obj.barProperty, Property
    assert.instanceOf obj.bazProperty, Property

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
    assert.instanceOf obj.fooProperty, Property
    assert.instanceOf obj.barProperty, Property

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
    
    
  it 'should calcul a prop only once and on demand', ->
    class TestClass extends Element
        callcount: 0
        @properties
          test: 
            calcul: ->
              @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.testProperty.get()
    assert.equal obj.callcount, 1
    obj.testProperty.get()
    assert.equal obj.callcount, 1
    
  it 'when destroyed, unbind all invalidators', ->
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
    assert.equal emitter.listenerCount('test'), 1
    obj.prop2
    assert.equal emitter.listenerCount('test'), 2
    res = obj.destroy()
    assert.equal emitter.listenerCount('test'), 0
  
    
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
      callcount: 0
      @properties
        prop: 
          change: ->
            assert.equal this.constructor, TestClass
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
      callcount1: 0
      callcount2: 0
      @properties
        prop: 
          change: (val, old) ->
             @callcount1 += 1
             
    TestClass.properties
      prop: 
        change: (val, old, overrided) ->
          overrided(val, old)
          @callcount2 += 1
          
    obj = new TestClass();
    
    assert.equal obj.callcount1, 1
    assert.equal obj.callcount2, 1
    obj.prop = 7
    assert.equal obj.prop, 7
    assert.equal obj.callcount1, 2, "original callcount"
    assert.equal obj.callcount2, 2, "new callcount"
    
            
  it.skip 'should propagate invalidation', ->
    val = 1
    class TestClass extends Element
      @include EventEmitter.prototype
      constructor: (@source) ->
        super()
      calculCount: 0
      @properties
        source: {}
        forwarded:
          calcul: (invalidator)->
            @calculCount++
            if invalidator.propByName('source')?
              invalidator.propByName('forwarded',@source)
            else
              val

    lvl1 = new TestClass()
    lvl2 = new TestClass(lvl1)
    lvl3 = new TestClass(lvl2)

    assert.equal lvl1.calculCount, 0, "lvl1 calculCount beginning"
    assert.equal lvl2.calculCount, 0, "lvl2 calculCount beginning"
    assert.equal lvl3.calculCount, 0, "lvl3 calculCount beginning"

    res = lvl3.forwardedProperty.get()

    assert.equal res, 1, "result for get"
    assert.equal lvl1.calculCount, 1, "lvl1 calculCount after get"
    assert.equal lvl2.calculCount, 1, "lvl2 calculCount after get"
    assert.equal lvl3.calculCount, 1, "lvl3 calculCount after get"

    val+=1
    lvl1.forwardedProperty.invalidate()

    assert.equal lvl1.calculCount, 1, "lvl1 calculCount after invalidate"
    assert.equal lvl2.calculCount, 1, "lvl2 calculCount after invalidate"
    assert.equal lvl3.calculCount, 1, "lvl3 calculCount after invalidate"

    res = lvl3.forwardedProperty.get()

    assert.equal res, 2, "result for get 2"
    assert.equal lvl1.calculCount, 2, "lvl1 calculCount after get 2"
    assert.equal lvl2.calculCount, 2, "lvl2 calculCount after get 2"
    assert.equal lvl3.calculCount, 2, "lvl3 calculCount after get 2"

  it.skip 'should not recalculate if no change while propagating', ->
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


