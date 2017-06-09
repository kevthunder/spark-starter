# SparkStarter

SparkStarter is a small javascript framework based around object properies and invalidation

## Requirement

SparkStarter requires at least ES2015 Support

Some of the Features requires your class to be an event emitter, you could use : https://github.com/Olical/EventEmitter

## Installation

### NPM

Install with npm
```sh
npm install kevthunder/spark-starter --save
```

Then include it
```javascript
var Spark = require('spark-starter')
```

### In the browser

[Download it](https://raw.githubusercontent.com/kevthunder/spark-starter/master/dist/spark-starter.min.js) (right click and save) or [use a cdn](https://rawgit.com/?url=https%3A%2F%2Fgithub.com%2Fkevthunder%2Fspark-starter%2Fblob%2Fmaster%2Fdist%2Fspark-starter.min.js)

Then include it in your document
```html
<script src="spark-starter.min.js"></script>
```

## Getting started

```javascript
function Apple() { }
Object.assign(Apple, Spark.Element);
Apple.properties({
  color: {
    default: 'red',
    change: function(old){
      alert('The apple color changed from '+old+' to '+this.color)
    }
  }
});

apple = new Apple();
apple.color = 'red'; // does not trigger an alert
apple.color = 'green'; // trigger an alert
```

## todo
  - override
  - Support for node's `require('events')`