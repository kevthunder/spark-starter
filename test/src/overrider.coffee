assert = require('chai').assert
Mixable = require('../lib/Mixable')
Overrider = require('../lib/Overrider')


describe 'Overrider', ->
  it 'can call an overrider function by itself', ->
    class TestClass extends Overrider
      @overrides
        foo: ->
          ['hello',@foo.withoutTestClass()]

    obj = new TestClass()
    assert.deepEqual obj.foo(), ['hello',undefined]

  it 'can override a function', ->
    class TestClass extends Overrider
      @overrides
        foo: ->
          ['hello',@foo.withoutTestClass()]

    class TestClass2
      foo: ->
        'hi'
    TestClass.prototype.extended(TestClass2.prototype)

    obj = new TestClass2()
    assert.deepEqual obj.foo(), ['hello','hi']

  it 'can override a function with mixable', ->
    class TestClass extends Overrider
      @overrides
        foo: ->
          ['hello',@foo.withoutTestClass()]

    class TestClass2 extends Mixable
      @extend TestClass
      foo: ->
        'hi'

    obj = new TestClass2()
    assert.deepEqual obj.foo(), ['hello','hi']

  it 'can override a function twice', ->
    class Mixin1 extends Overrider
      @overrides
        foo: ->
          ['hello',@foo.withoutMixin1()].join(' ')

    class Mixin2 extends Overrider
      @overrides
        foo: ->
          ['hey',@foo.withoutMixin2()].join(' ')

    class TestClass2 extends Mixable
      @extend Mixin1
      @extend Mixin2
      foo: ->
        'hi'

    obj = new TestClass2()
    assert.equal obj.foo(), 'hey hello hi'

  it 'can use a specific override function', ->
    class Mixin1 extends Overrider
      @overrides
        foo: ->
          'hello'

    class Mixin2 extends Overrider
      @overrides
        foo: ->
          'hey'

    class TestClass2 extends Mixable
      @extend Mixin1
      @extend Mixin2
      foo: ->
        'hi'

    obj = new TestClass2()
    assert.equal obj.foo(), 'hey'
    assert.equal obj.foo.withMixin1(), 'hello'
    assert.equal obj.foo.withoutMixin1(), 'hi'

  it 'does not change the original function', ->
    class Mixin1 extends Overrider
      @overrides
        foo: ->
          ['hello',@foo.withoutMixin1()].join(' ')

    class Mixin2 extends Overrider
      @overrides
        foo: ->
          ['hey',@foo.withoutMixin2()].join(' ')

    class TestClass extends Mixable
      @extend Mixin1
      @extend Mixin2
      foo: ->
        'hi'

    obj = new TestClass()
    alone1 = new Mixin1()
    alone2 = new Mixin2()
    assert.equal obj.foo(), 'hey hello hi'
    assert.equal alone1.foo(), 'hello '
    assert.equal alone2.foo(), 'hey '