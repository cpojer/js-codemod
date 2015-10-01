const module = require('module');

for (let i = 0; i < 10; i++) {

}

for (let i = 0; i < 10; i++) {
}

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
  'd': 4
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

