/* eslint-disable no-extra-bind */
'use strict';

outer('test', function(t) {
  t.forEach(async function(name) {
    console.log("test");
  });
});