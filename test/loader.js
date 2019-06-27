(function() {
  var Loader, assert;

  assert = require('chai').assert;

  Loader = require('../lib/Loader');

  describe('Loader', function() {
    it('can load class on when created', function() {
      var Dependency, Test, test;
      Dependency = class Dependency {
        constructor(opt) {
          this.opt = opt;
        }

      };
      Test = (function() {
        class Test extends Loader {};

        Test.prototype.preloaded = [
          {
            type: Dependency
          }
        ];

        return Test;

      }).call(this);
      test = new Test();
      assert.isDefined(test.preloaded[0].instance);
      assert.instanceOf(test.preloaded[0].instance, Dependency);
      return assert.equal(test.preloaded[0].instance.opt.loader, test);
    });
    return it('can call init on a loaded class', function() {
      var Dependency, Test, test;
      Dependency = class Dependency {
        constructor(opt) {
          this.opt = opt;
        }

        init() {
          return this.inited = true;
        }

      };
      Test = (function() {
        class Test extends Loader {};

        Test.prototype.preloaded = [
          {
            type: Dependency,
            initByLoader: true
          }
        ];

        return Test;

      }).call(this);
      test = new Test();
      assert.isDefined(test.preloaded[0].instance);
      return assert.isTrue(test.preloaded[0].instance.inited);
    });
  });

}).call(this);

//# sourceMappingURL=maps/loader.js.map
