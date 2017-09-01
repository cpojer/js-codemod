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

    /**
     * This is a constructor comment. It should come along as well and is a special case.
     */
    function MyObject(param1, param2) {
      SuperClass.call(this, param1);

      this.param2 = param2;

      this._thing1 = 100;
    }

    // This comment shouldn't be affected.
    MyObject.prototype = Object.create(SuperClass.prototype, {

      /**
       * This is a comment that should come along.
       */
      getParam2: {
        // There shouldn't be comments in this part of the code for the most part.
        // Adding this here to ensure it doesn't get put in some weird place.
        get: function() {
          return this.param2;
        },
        configurable: true
      },

      thing1: {
        get: function() {
          return this._thing1;
        },

        set: function(newVal) {
          this._thing1 = newVal + 1;
        },
        enumerable: true
      },

      /**
       * Docs are important.
       */
      aFn: {
        value : function(fnParam1, fnParam2) {
          return fnParam1 + fnParam2;
        },
        writable: true,
        configurable: true
      }

    });

    // Extra stuff in here shouldn't be touched either.
    var c = 1999;

    return MyObject;
  }
);
