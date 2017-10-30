assert = require('chai').assert
ComposedProperty = require('../lib/ComposedProperty')
Property = require('../lib/Property')

describe 'ComposedProperty', ->


  it 'should return collection when collection config is on', ->
    prop = new Property('prop',{
      composed: true
    });
    prop = prop.getInstance({})
    
    assert.instanceOf prop, ComposedProperty
    
  it 'should not return collection when collection config is undefined', ->
    prop = new Property('prop');
    prop = prop.getInstance({})
    
    assert.notInstanceOf prop, ComposedProperty