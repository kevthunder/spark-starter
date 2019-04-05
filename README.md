# SparkStarter

SparkStarter is a small javascript framework based around object properies and invalidation

## Why ?

Yes, I know, I am developing yet another js framework. But I just could not help it.

All started when after using the same programmation pattern over and over again, i started to wonder if this could be done automatically. 

This pattern :
```
{
   setFoo: function(newValue){
      var oldValue = this.foo;
      if(oldValue  !== newValue){
         this.foo = newValue;
         this.updateSomething(newValue, oldValue);
      }
      Return this.foo;
   }
}
```

This is a simple setter ( I skipped the `Object.defineProperty` for simplicity sake), but the fact of checking that the value changed before doing an update is something that end up optimising a lot an app. 

But i wanted to do more, I wanted to only do the updates if it was needed. Example If variable B was dependent on variable A, setting A would not trigger a re-calcul of B until B is actually fetched.

This process of reminding the value of property and invalidating it once a dependency is updated is like having Russian doll caching baked in the very core of you application, making it perform with little effort. It also ended up feeling a lot like the data-binding some popular framework like VueJs and React use, but without the need of binding to a DOM. Awesome.

And now I can't stop Improving it.


## Requirement

SparkStarter requires at least ES2015 Support

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

A Spark-starter property will only trigger a change when the set value is different than before
```javascript
class Apple extends Spark.Element { };
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

A Spark-starter property can be calculated from other properties and the calculation itself will only happens when needed.
```javascript
class Basket extends Spark.Element { };
Basket.extend(Spark.EventEmitter) // this will not be needed in future versions
Basket.properties({
  numberOfApple: {
    default: 1
  },
  numberOfBanana: {
    default: 1
  }
  numberOfFruits: {
    calcul: function(invalidator){
      console.log('calculing the number of fruits in the basket...');
      return invalidator.prop('numberOfApple') + invalidator.prop('numberOfBanana');
    }
  }
});

myBasket = new Basket();
myBasket.numberOfFruits; // will return 2 and show a log in the console
myBasket.numberOfFruits; // will return 2 but will not show a log because the value was already calculated
myBasket.numberOfApple = 2; // will not trigger a re-calcul
myBasket.numberOfBanana = 3; // will not trigger a re-calcul
myBasket.numberOfFruits; // will return 5 and show a log
myBasket.numberOfFruits; // will return 5 with no log

```

## todo
  - more tests
  - Create a complete documentation
  - Remove the need to manually add a EventEmitter
  - Revisit the `change` and `updater` options to make the easier to use.
  - option (shortcut) to forward methods from a property's value
