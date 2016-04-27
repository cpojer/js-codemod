const one = 1;
const two = 2;
const four = 4;

const myFunc = function() { };

const myObj = {
  one,
  two,
  three: one,
  four,
  myFunc,
  ['computed' + 'property']: 1,
  method() { },
  method2: () => { },
};