# How to upgrade

## From 0.10 to 0.11

### invalidate

old:
```
obj.invalidateName()
```
new:
```
obj.nameProperty.invalidate()
```
search
```
(\W)invalidate(\w+)\(\)
```
replace
```
# You need to change the capital manually
$1$2Property.invalidate()
```

### Property instance

old:
```
obj._name
```
new:
```
obj.nameProperty
```
search
```
# will potentially catch other things
(\W)_(\w+)(\W)
```

### Property instance by name

old:
```
obj.getPropertyInstance('name')
```
new:
```
obj.propertiesManager.getProperty('name')
```
search
```
([.@])getPropertyInstance\(
```
replace
```
$1propertiesManager.getProperty(
```

### invalidator: prop by name

old:
```
invalidator.prop('name')
```
new:
```
invalidator.propByName('name')
```
search
```
\.prop\('(\w+)'
```
replace
```
.propByName('$1
```

### change arguments

old:
```
  Class.properties({
    tile: {
      change: function(old) {
      }
    }
  }
```
new:
```
  Class.properties({
    tile: {
      change: function(val, old) {
      }
    }
  }
```
search
```
change:(\s*(function)?)\(([^v^)])
```
replace
```
change:$1(val, $3
```

### Adding a property as a member of a composed property

old:
```
  obj.propMembers.addPropertyRef('open',this)
```
new:
```
  obj.propMembers.addProperty(this.openProperty)
```
search
```
\.addPropertyRef\(['"](\w+)['"],([^)]+)\)
```
replace
```
.addProperty($2.$1Property)
```

### watcher namespace

old:
```
  require('spark-starter').Invalidated.PropertyWatcher
```
new:
```
  require('spark-starter').watchers.PropertyWatcher
```


### direct get and set Function

removed:
```
obj.getName()
obj.setName('')
```
alternatives:
```
obj.name
obj.name = ''
```

### Destroying properties

old:
```
  this.destroyProperties()
```
new:
```
  this.propertiesManager.destroy()
```
search
```
([.@])destroyProperties\(\)
```
replace
```
$1propertiesManager.destroy()
```