assert = require('chai').assert
PropertyInstance = require('../lib/PropertyInstance')
Property = require('../lib/Property')
Invalidator = require('../lib/Invalidator')
Updater = require('../lib/Updater')

describe 'PropertyInstance', ->

  propEvents = ['testInvalidated','testUpdated']
  updateEvents = ['propChanged','propUpdated']
  
  it 'should flag as manual setted properties', ->
    prop = new Property('prop',{}).getInstance({});

    prop.set(10)
    assert.equal prop.manual, true
    
  it 'can invalidate a property that has a get function', ->
  
    prop = new Property('prop',{
      get: ->
         3
    }).getInstance({});
    
    assert.equal prop.value, undefined
    assert.equal prop.calculated, false
    res = prop.get()
    assert.equal res, 3
    assert.equal prop.calculated, true
    prop.invalidate()
    assert.equal prop.calculated, false
  
  it 'should allow to alter the input value', ->
    prop = new Property('prop',{
      ingest: (val)->
        if val == 2
          'two'
        else
          val
    }).getInstance({});
    
    prop.set(2)
    assert.equal prop.value, 'two'
    prop.set('zero')
    assert.equal prop.value, 'zero'
    
  