assert = require('chai').assert
Collection = require('../lib/Collection')

describe 'Collection', ->
  it 'can count items', ->
    coll = new Collection([1,2,3])
    assert.equal coll.count(), 3
    
  it 'can get item', ->
    coll = new Collection([1,2,3])
    assert.equal coll.get(1), 2
    
  it 'can set item', ->
    coll = new Collection([1,2,3])
    assert.equal coll.get(1), 2
    coll.set(1, 4)
    assert.equal coll.get(1), 4
    
  it 'can push item', ->
    coll = new Collection([1,2,3])
    assert.equal coll.count(), 3, 'old Count'
    coll.push(4)
    assert.equal coll.count(), 4, 'new Count'
    assert.equal coll.get(3), 4, 'new val'
    
  it 'can convert to array', ->
    coll = new Collection([1,2,3])
    arr = coll.toArray()
    assert.isTrue arr instanceof Array
    assert.equal arr.toString(), '1,2,3'
    
  it 'has string representation', ->
    coll = new Collection([1,2,3])
    assert.equal coll.toString(), '1,2,3'
    
  it 'can remove an item', ->
    coll = new Collection([1,2,3])
    assert.equal coll.count(), 3, 'old Count'
    coll.remove(2)
    assert.equal coll.count(), 2, 'new Count'
    assert.equal coll.toString(), '1,3'
    
  it 'should trigger changed when seting item', ->
    calls = 0
    coll = new Collection([1,2,3])
    coll.changed = ->
      calls++
    assert.equal calls, 0
    assert.equal coll.get(1), 2
    coll.set(1, 4)
    assert.equal coll.get(1), 4
    assert.equal calls, 1
    
  it 'should not trigger changed when seting item to same value', ->
    calls = 0
    coll = new Collection([1,2,3])
    coll.changed = ->
      calls++
    assert.equal calls, 0
    assert.equal coll.get(1), 2
    coll.set(1, 2)
    assert.equal coll.get(1), 2
    assert.equal calls, 0
    
  it 'should trigger changed when removing item', ->
    calls = 0
    coll = new Collection([1,2,3])
    coll.changed = ->
      calls++
    assert.equal calls, 0
    assert.equal coll.count(), 3, 'old Count'
    coll.remove(2)
    assert.equal coll.count(), 2, 'new Count'
    assert.equal coll.toString(), '1,3'
    assert.equal calls, 1
    
    
  it 'should not trigger changed when tying to removing inexistant item', ->
    calls = 0
    coll = new Collection([1,2,3])
    coll.changed = ->
      calls++
    assert.equal calls, 0
    assert.equal coll.count(), 3, 'old Count'
    coll.remove(7)
    assert.equal coll.count(), 3, 'new Count'
    assert.equal coll.toString(), '1,2,3'
    assert.equal calls, 0
    
  it 'should trigger changed when pushing an item', ->
    calls = 0
    coll = new Collection([1,2,3])
    coll.changed = ->
      calls++
    assert.equal calls, 0
    assert.equal coll.count(), 3, 'old Count'
    coll.push(4)
    assert.equal coll.count(), 4, 'new Count'
    assert.equal coll.get(3), 4, 'new val'
    assert.equal calls, 1