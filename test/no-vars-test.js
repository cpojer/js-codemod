var module = require('module');

for (var i = 0; i < 10; i++) {

}

for (i = 0; i < 10; i++) {
}

var shouldBeLet = 0;
var shouldBeConst = 0;

function mutate() {
  shouldBeLet = 1;
}

var array = ['a', 'b', 'c', 'd'];

for (var letter in array) {
  console.log(letter);
}

var object = {
  'a': 1,
  'b': 2,
  'c': 3,
  'd': 4
};

for (var [key, value] of object.entries()) {
  console.log(key, value);
}

var whileIterator = 10;
while (whileIterator > 0) {
  whileIterator--;
}

var z = 10;
do {
  var a = 0;
  var b = 1;
  a += b;
  console.log(a, b);
} while (z--);

