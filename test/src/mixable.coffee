assert = require('chai').assert
Mixable = require('../lib/Mixable')


describe 'Mixable', ->
  
  it 'can get includable attributes', ->
    class TestClass extends Mixable
      foo: ->
        'hello'

    class TestClass2 extends Mixable

    assert.deepEqual Mixable.Extension.getExtensionProperties(TestClass.prototype, TestClass2.prototype).map((prop)->prop.name), ['foo']

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
      baz: 'hi'
      @bar = -> 'hey'

    class SupClass extends BaseClass
      
    class TestClass extends Mixable
      @extend SupClass

    assert.equal TestClass.bar(), 'hey'
    obj = new TestClass();
    assert.equal obj.foo(), 'hello'
    assert.equal obj.baz, 'hi'

  it 'can extend a nested class with same property', ->
    class BaseClass extends Mixable
      foo: -> 'hello'

    class SupClass extends BaseClass
      foo: -> 'hi'
      
    class TestClass extends Mixable
      @extend SupClass

    obj = new TestClass();
    assert.equal obj.foo(), 'hi'


  it 'can extend properties with accessor', ->
    val = 1
    class BaseClass extends Mixable
    Object.defineProperty(BaseClass.prototype,'foo',{
      get: -> val
    })

    class TestClass extends Mixable
      @extend BaseClass

    obj = new TestClass()

    assert.equal obj.foo, 1
    val = 2
    assert.equal obj.foo, 2
