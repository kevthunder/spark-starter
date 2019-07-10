(function() {
  var Loader, Mixable, assert;

  assert = require('chai').assert;

  Loader = require('../lib/Loader');

  Mixable = require('../lib/Mixable');

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
    it('can call init on a loaded class', function() {
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
    return it('can load classes from 2 mixed classes', function() {
      var Dependency1, Dependency2, Loader1, Loader2, MixedLoader, test;
      Dependency1 = class Dependency1 {
        constructor(opt) {
          this.opt = opt;
        }

      };
      Dependency2 = class Dependency2 {
        constructor(opt) {
          this.opt = opt;
        }

      };
      Loader1 = (function() {
        class Loader1 extends Loader {};

        Loader1.prototype.preloaded = [
          {
            type: Dependency1
          }
        ];

        return Loader1;

      }).call(this);
      Loader2 = (function() {
        class Loader2 extends Loader {};

        Loader2.prototype.preloaded = [
          {
            type: Dependency2
          }
        ];

        return Loader2;

      }).call(this);
      MixedLoader = class MixedLoader extends Loader1 {};
      Mixable.Extension.make(Loader2.prototype, MixedLoader.prototype);
      test = new MixedLoader();
      assert.isDefined(test.preloaded[0].instance);
      assert.instanceOf(test.preloaded[0].instance, Dependency1);
      assert.equal(test.preloaded[0].instance.opt.loader, test);
      assert.isDefined(test.preloaded[1].instance);
      assert.instanceOf(test.preloaded[1].instance, Dependency2);
      return assert.equal(test.preloaded[1].instance.opt.loader, test);
    });
  });

}).call(this);

//# sourceMappingURL=maps/loader.js.map
