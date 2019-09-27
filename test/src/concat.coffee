assert = require('chai').assert

describe 'concatened file check', ->

  tests = (source) => 
    Spark = null

    before ->
      Spark = require(source)

    it 'contains Element', ->
      assert.isFunction Spark.Element
    it 'contains Collection', ->
      assert.isFunction Spark.Collection
    it 'contains Property', ->
      assert.isFunction Spark.Property
    it 'can create working Element', ->
      class TestClass extends Spark.Element
        @properties
          hello:
            calcul: ->
              'hello'
      obj = new TestClass()
      assert.equal obj.hello, 'hello'

  describe 'lib/spark-starter.js', ->
    tests '../lib/spark-starter.js'

  describe 'dist/spark-starter.min.js', ->
    tests '../dist/spark-starter.min.js'