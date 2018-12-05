assert = require('chai').assert
Collection = require('../lib/Collection')

describe 'Collection', ->
  it 'can count items', ->
    coll = new Collection([1,2,3])
    assert.equal coll.count(), 3
    assert.equal coll.length, 3
    
  it 'can get item', ->
    coll = new Collection([1,2,3])
    assert.equal coll.get(1), 2

  it 'can be iterated', ->
    coll = new Collection([1,2,3])
    assert.equal JSON.stringify(`[...coll]`), '[1,2,3]'
    
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

  it 'can get randomitem', ->
    coll = new Collection([1,2,3])
    res = coll.getRandom()
    assert.isTrue coll.includes(res)

    i = 0
    val2 = coll.getRandom()
    while res == val2
        val2 = coll.getRandom()
        i++
        if i > 1000
            break
    assert.notEqual res, val2
    
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

  it 'can pluck an item', ->
    coll = new Collection([1,2,3])
    assert.equal coll.count(), 3, 'old Count'
    coll.pluck (item)->
      item == 2
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
    
  it 'can detect changes', ->
    coll = new Collection([1,2,3])

    assert.isFalse coll.checkChanges([1,2,3])
    assert.isTrue coll.checkChanges(["1","2","3"])
    assert.isTrue coll.checkChanges([1,2,4])
    assert.isTrue coll.checkChanges([1,2])
    assert.isTrue coll.checkChanges([1,3,2])
    assert.isFalse coll.checkChanges([1,3,2],false)
    assert.isTrue coll.checkChanges(["1","2","3"],false)
    assert.isTrue coll.checkChanges([1,2,4],false)
    assert.isTrue coll.checkChanges([1,2],false)

    compareFunction = (a,b)->
      a.toString() == b.toString()

    assert.isFalse coll.checkChanges([1,2,3], true, compareFunction)
    assert.isFalse coll.checkChanges(["1","2","3"], true, compareFunction)
    assert.isFalse coll.checkChanges(["1","3","2"], false, compareFunction)
    assert.isTrue coll.checkChanges(["4","2","3"], true, compareFunction)
    assert.isTrue coll.checkChanges([1,3], true, compareFunction)

  it 'can detect changes from a null like its an empty array', ->
    assert.isTrue (new Collection([1,2,3])).checkChanges(null)

    assert.isFalse (new Collection([])).checkChanges(null)


  it 'can tell what items were added compared to another array', ->
    old = [1,2,3]
    newColl = new Collection([1,4,2,3,5])
    assert.equal newColl.getAddedFrom(old).toString(), '4,5'
  
  it 'can tell what items were removed compared to another array', ->
    old = [1,2,3]
    newColl = new Collection([1])
    assert.equal newColl.getRemovedFrom(old).toString(), '2,3'
  
  it 'can add an item once', ->
    coll = new Collection([1,2,3])
    coll.add(4)
    assert.equal coll.toString(), '1,2,3,4'
    coll.add(4)
    assert.equal coll.toString(), '1,2,3,4'
    

  it 'can copy itself to a new independant collection ', ->
    coll = new Collection([1,2,3,4])
    assert.equal coll.toString(), '1,2,3,4'
    coll2 = coll.copy()
    assert.equal coll2.toString(), '1,2,3,4'
    coll2.pop()
    assert.equal coll2.toString(), '1,2,3'
    assert.equal coll.toString(), '1,2,3,4'
    
  
  it 'returns a collection when calling filter and forward added functions', ->
    coll = Collection.newSubClass({
      test: -> 'test'
    },[1,2,3,4])
    res = coll.filter (item)-> item % 2 == 1
    assert.equal res.toString(), '1,3'
    assert.instanceOf res, Collection
    assert.equal res.test(), 'test'