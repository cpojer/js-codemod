'use strict';

const defineInlineTest = require('jscodeshift/dist/testUtils').defineInlineTest;
const transform = require('../no-reassign-params');

describe('no-reassign-params', () => {
  // Ignore generated files
  defineInlineTest(
    transform,
    undefined,
    `
// @` +
      `generated
function foo(boo) {
  boo++
}`,
    '',
  );

  // Function declaration
  defineInlineTest(
    transform,
    undefined,
    `
function foo(boo, val) {
  val = 4;

  function bar(val) {
    return val + 1;
  }

  return boo++ + val;
}`,
    `
function foo(boo, val) {
  let localBoo = boo;
  let localVal = val;
  localVal = 4;

  function bar(val) {
    return val + 1;
  }

  return localBoo++ + localVal;
}`,
  );

  // arrow function
  defineInlineTest(
    transform,
    undefined,
    `
(boo, val) => {
  val = 4;

  function bar(val) {
    return val + 1;
  }

  return boo++ + val;
}`,
    `
(boo, val) => {
  let localBoo = boo;
  let localVal = val;
  localVal = 4;

  function bar(val) {
    return val + 1;
  }

  return localBoo++ + localVal;
}`,
  );

  // function assignment
  defineInlineTest(
    transform,
    undefined,
    `
const foo3 = function(boo, val) {
  val = 4;

  function bar(val) {
    return val + 1;
  }

  return boo++ + val;
}
`,
    `
const foo3 = function(boo, val) {
  let localBoo = boo;
  let localVal = val;
  localVal = 4;

  function bar(val) {
    return val + 1;
  }

  return localBoo++ + localVal;
}`,
  );

  // inner function
  defineInlineTest(
    transform,
    undefined,
    `
function foo(bar) {
  function boo(bar) {
    bar = 2;
    return bar;
  }
}`,
    `
function foo(bar) {
  function boo(bar) {
    let localBar = bar;
    localBar = 2;
    return localBar;
  }
}`,
  );

  // defined in outer scope. Should leave unchanged.
  // Can support this later if necessary
  defineInlineTest(
    transform,
    undefined,
    `
let localFoo = 2;
function foo(foo) {
  foo = 4;
  return foo;
}`,
    '',
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo({x}) {
  x = 4;
  return x;
}`,
    `
function foo({x}) {
  let localX = x;
  localX = 4;
  return localX;
}`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo(keys) {
  keys++;
  [].push({
    keys: keys
  });
}`,
    `
function foo(keys) {
  let localKeys = keys;
  localKeys++;
  [].push({
    keys: localKeys
  });
}`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo(x, y, z) {
  ({y, z} = x);

  return y + z;
}`,
    `
function foo(x, y, z) {
  let localY = y;
  let localZ = z;
  ({y: localY, z: localZ} = x);

  return localY + localZ;
}`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo(x, y, z) {
  ({y: y, z: z} = x);

  return y + z;
}`,
    `
function foo(x, y, z) {
  let localY = y;
  let localZ = z;
  ({y: localY, z: localZ} = x);

  return localY + localZ;
}`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo(...args) {
  args = args.slice(0, 1);
}`,
    `
function foo(...args) {
  let localArgs = args;
  localArgs = localArgs.slice(0, 1);
}`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo(arg) {
  arg = {
    arg: arg
  };
}`,
    `
function foo(arg) {
  let localArg = arg;
  localArg = {
    arg: localArg
  };
}`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
const toImage = ({focus, image, ...rest}) => ({
  ...rest,
  ...image,
  ...(focus ? {focusX: focus.x, focusY: focus.y} : null),
});`,
    '',
  );

  defineInlineTest(
    transform,
    undefined,
    `
const GKSwitch = ({label, value, onChange, ...props}) => (
  <View style={[styles.input, styles.switchInput]}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch {...props} value={value} onValueChange={onChange} />
  </View>
);`,
    '',
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo([{value: Component}, props]) {
  Component = 4;
}`,
    `
function foo([{value: Component}, props]) {
  let LocalComponent = Component;
  LocalComponent = 4;
}
    `,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo([, props]) {
  props = 4;
}`,
    `
function foo([, props]) {
  let localProps = props;
  localProps = 4;
}`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo(num) {
  num++;

  return <div num={num} />;
}
`,
    `
function foo(num) {
  let localNum = num;
  localNum++;

  return <div num={localNum} />;
}
`,
  );

  defineInlineTest(
    transform,
    undefined,
    `
function func(i) {
  var range = foo(i), i = -1;

  i++;
}
`,
    '',
  );

  defineInlineTest(
    transform,
    undefined,
    `
function foo(Component) {
  Component = <div />;
}
`,
    `
function foo(Component) {
  let LocalComponent = Component;
  LocalComponent = <div />;
}
      `,
  );

  // Function declaration
  defineInlineTest(
    transform,
    undefined,
    `
// @format
function foo(boo) {boo++;}`,
    `
// @format
function foo(boo) {
  let localBoo = boo;
  localBoo++;
}`,
  );

  // Shadowing function argument
  // This doesn't work yet and is the major blocker to us being able to
  // use this at Facebook.
//   defineInlineTest(
//     transform,
//     undefined,
//     `
// function foo(x) {
//   x = 2;
//   var x = 4;
//   return x;
// }`,
//     `
// function foo({x}) {
//   let localX = x;
//   localX = 2;

//   var localX2 = 4;
//   return localX2;
// }`,
//   );
});
