assert = require('chai').assert

describe 'concatened file check', ->

  describe 'lib/spark-starter.js', ->
    Spark =null
    before ->
      Spark = require('../lib/spark-starter.js')

    it 'contains Element', ->
      assert.isFunction Spark.Element
    it 'contains Collection', ->
      assert.isFunction Spark.Collection
    it 'can create working Element', ->
      class TestClass extends Spark.Element
        @properties
          hello:
            calcul: ->
              'hello'
      obj = new TestClass()
      assert.equal obj.hello, 'hello'

  describe 'dist/spark-starter.min.js', ->
    Spark =null
    before ->
      Spark = require('../dist/spark-starter.min.js')

    it 'contains Element', ->
      assert.isFunction Spark.Element
    it 'contains Collection', ->
      assert.isFunction Spark.Collection
    it 'can create working Element', ->
      class TestClass extends Spark.Element
        @properties
          hello:
            calcul: ->
              'hello'
      obj = new TestClass()
      assert.equal obj.hello, 'hello'