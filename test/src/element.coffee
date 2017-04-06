assert = require('chai').assert
Element = require('../dist/spark-starter')

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
    
  it 'allow access to old and new value in change function', ->
    class TestClass extends Element
        constructor: () ->
        @properties
          prop:
            default: 7
    obj = new TestClass();
    
    obj.changeProp = (old)->
      assert.equal @_prop, 11
      assert.equal old, 7
    obj.setProp(11)
    
  it 'should init a prop only once and on demand', ->
    class TestClass extends Element
        constructor: () ->
          @callcount = 0
        @properties
          prop: 
            init: ->
               @callcount += 1
    obj = new TestClass();
    
    assert.equal obj.callcount, 0
    obj.getProp()
    assert.equal obj.callcount, 1
    obj.getProp()
    assert.equal obj.callcount, 1
    