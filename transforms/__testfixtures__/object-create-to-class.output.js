define(
  [
    'jquery',
    'path/to/dep1',
    'path/to/dep2',
    'path/to/SuperClass'
  ],
  function($, dep1, dep2, SuperClass) {
    'use strict';

    /**
     * This function shouldn't be affected at all by the transformation.
     */
    function extraFn() {
      console.log('hello');
    }

    // This comment shouldn't be affected.
    class MyObject extends SuperClass {
      /**
       * This is a constructor comment. It should come along as well and is a special case.
       */
      constructor(param1, param2) {
        super(param1);

        this.param2 = param2;

        this._thing1 = 100;
      }

      /**
       * This is a comment that should come along.
       */
      get getParam2() {
        return this.param2;
      }

      get thing1() {
        return this._thing1;
      }

      set thing1(newVal) {
        this._thing1 = newVal + 1;
      }

      /**
       * Docs are important.
       */
      aFn(fnParam1, fnParam2) {
        return fnParam1 + fnParam2;
      }
    };

    // Extra stuff in here shouldn't be touched either.
    var c = 1999;

    return MyObject;
  }
);
