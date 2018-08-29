assert = require('chai').assert
Mixable = require('../lib/Mixable')


describe 'Mixable', ->
  
  it 'can get includable attributes', ->
    class TestClass extends Mixable
      foo: ->
        'hello'

    class TestClass2 extends Mixable

    assert.deepEqual Mixable.Extension.getExtensionProperties(TestClass.prototype, TestClass2.prototype), ['foo']

  it 'can get prototype chain', ->
    class TestClass extends Mixable

    class TestClass2 extends TestClass

    assert.deepEqual Mixable.Extension.getPrototypeChain(TestClass2), [TestClass2, TestClass, Mixable]


  it 'can include functions from an object', ->
    toInclude = {
      foo: 'hello'
    }
    class TestClass extends Mixable
      @include toInclude

    obj = new TestClass();
    assert.equal obj.foo, 'hello'

  it 'can extend a third class', ->
    class BaseClass extends Mixable
      foo: -> 'hello'
      @bar = -> 'hey'
      
    class TestClass extends Mixable
      @extend BaseClass

    assert.equal TestClass.bar(), 'hey'
    obj = new TestClass();
    assert.equal obj.foo(), 'hello'

  it 'can extend a nested class', ->
    class BaseClass extends Mixable
      foo: -> 'hello'
      @bar = -> 'hey'

    class SupClass extends BaseClass
      
    class TestClass extends Mixable
      @extend SupClass

    assert.equal TestClass.bar(), 'hey'
    obj = new TestClass();
    assert.equal obj.foo(), 'hello'