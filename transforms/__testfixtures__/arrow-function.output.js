/* eslint-disable no-extra-bind */
'use strict';

var fn1 = () => console.log('Banana!');

var fn2 = (function() {
  console.log('Banana banana!');
}).bind(this, 1, 2, 3);

var fn3 = (a, b, c) => {
  console.log('foo!');
  console.log(a, b, c);
};

var fn4 = () => console.log('foo!');

var fn5 = (function named() {
  console.log("don't transform me!");
}).bind(this);

var fn6 = () => ({
  a: 1,
});

[1, 2, 3].map(x => x * x);
