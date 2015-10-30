/* eslint-disable one-var, prefer-const */

const module = require('module');

for (let i = 0; i < 10; i++) {

}

for (let i = 0; i < 10; i++) {
}

let letItBe;
let shouldBeLet = 0;
const shouldBeConst = 0;

function mutate() {
  shouldBeLet = 1;
}

const array = ['a', 'b', 'c', 'd'];

for (let letter in array) {
  console.log(letter);
}

const object = {
  'a': 1,
  'b': 2,
  'c': 3,
  'd': 4,
};

for (let [key, value] of object.entries()) {
  console.log(key, value);
}

let whileIterator = 10;
while (whileIterator > 0) {
  whileIterator--;
}

let z = 10;
do {
  let a = 0;
  const b = 1;
  a += b;
  console.log(a, b);
} while (z--);

() => {
  let a = 1;

  return () => {
    return _ = _ => _ => _ => _ => _ => { a = 7; };
  }();
}();

() => {
  let a = 1;
  const b = 2, c = 3;

  a++;

  return b + a;
}();

() => {
  for (var i = 0, z = 77; i < 10; i++) {
    setTimeout(() => console.log(i));
  }

  for (var j = 0; j < 10; j++) {
    _.defer(function() {
      console.log(j);
    });
  }

  for (let k = 0; k < 10; k++) {
    console.log(i);
  }

  // I should be left alone
  for (let z = 0; z < 10; z++) {
    setTimeout(() => console.log(z));
  }
}();

() => {
  let {foo, number} = bar;
  foo = xy;
  number++;
}();

() => {
  // should not destroy comments
  let querySet = {};
  if (true) {
    ({querySet} = someComputation());
  }
}();

