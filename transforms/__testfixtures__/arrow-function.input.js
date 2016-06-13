/* eslint-disable no-extra-bind */
'use strict';

var fn1 = (function() {
  console.log('Banana!');
}).bind(this);

var fn2 = (function() {
  console.log('Banana banana!');
}).bind(this, 1, 2, 3);

var fn3 = (function(a, b, c) {
  console.log('foo!');
  console.log(a, b, c);
}).bind(this);

var fn4 = (function() {
  console.log('foo!');
}).bind(this);

var fn5 = (function named() {
  console.log("don't transform me!");
}).bind(this);

var fn6 = (function() {
  return {
    a: 1,
  };
}).bind(this);

[1, 2, 3].map(function(x) {
  return x * x;
}.bind(this));

[1, 2, 3].map(function(x) {
  return x * x;
});

compare(1, 2, function(num1, num2) {
  return num1 > num2;
});

Promise.resolve()
.then(function() {
  console.log('foo');
}.bind(this, 'a'))
.then(function(a) {
  return 4;
});

foo(function(a) {
  this.bar(function() {
    return a + this.b;
  });
});

foo(function(a) {
  bar(function() {
    return a + this.b;
  });
});

foo(function(a) {
  bar(function() {
    return a + this.b;
  }.bind(this));
});

foo(function bar() {
  console.log('foo');
});

foo(function baz_prototype() {
  console.log('foo');
});

baz_prototype.prototype = {};
