assert = require('chai').assert
Loader = require('../lib/Loader')

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


