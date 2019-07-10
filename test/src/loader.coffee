assert = require('chai').assert
Loader = require('../lib/Loader')
Mixable = require('../lib/Mixable')

describe 'Loader', ->
  it 'can load class on when created', ->
    class Dependency
      constructor: (@opt)->

    class Test extends Loader
      preloaded: [{
        type: Dependency
      }]

    test = new Test()
    assert.isDefined test.preloaded[0].instance
    assert.instanceOf test.preloaded[0].instance, Dependency
    assert.equal test.preloaded[0].instance.opt.loader, test

  it 'can call init on a loaded class', ->
    class Dependency
      constructor: (@opt)->
      init: ->
        @inited = true

    class Test extends Loader
      preloaded: [{
        type: Dependency
        initByLoader: true
      }]

    test = new Test()
    assert.isDefined test.preloaded[0].instance
    assert.isTrue test.preloaded[0].instance.inited

  it 'can load classes from 2 mixed classes', ->
    class Dependency1
      constructor: (@opt)->

    class Dependency2
      constructor: (@opt)->

    class Loader1 extends Loader
      preloaded: [{
        type: Dependency1
      }]

    class Loader2 extends Loader
      preloaded: [{
        type: Dependency2
      }]

    class MixedLoader extends Loader1
    Mixable.Extension.make(Loader2.prototype, MixedLoader.prototype);

    test = new MixedLoader()
    assert.isDefined test.preloaded[0].instance
    assert.instanceOf test.preloaded[0].instance, Dependency1
    assert.equal test.preloaded[0].instance.opt.loader, test
    assert.isDefined test.preloaded[1].instance
    assert.instanceOf test.preloaded[1].instance, Dependency2
    assert.equal test.preloaded[1].instance.opt.loader, test


