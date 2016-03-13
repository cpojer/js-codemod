/* eslint-disable quotes */
var test;
test = 'hitrue';
test = 'truehi';

test = 'hi12';
test = 'hi123';
test = `${1 + 2}hi`;

test = 'hi1' - 2;
test = 'hi1' - 2 - 3;
test = `${1 - 2}hi`;

test = `hi${1 * 2}`;
test = `${1 * 2}hi`;

test = `hi${1 / 2}`;
test = `${1 / 2}hi`;

test = `hi${foo}`; // single
test = `hi${foo}`; // double
test = `hi${foo}`; // template literal
test = foo`hi` + bar; // tagged template literal

test = `hi
hello${foo}`; // line break
test = `hi${foo}`;
test = `hi${foo}`;
test = `hi${foo}`; // and at the end

test = 'hifoo'; // template literal and string
test = 'hifoo'; // string and template literal
test = 'hifoo'; // two strings
test = 'hifoobar'; // three strings
test = 'hifoo'; // two template literals
test = 'hifoobar'; // three template literals

test = `${hi}foo`; // template literal with expression and string
test = `foo${hi}`; // string and template literal with expression
test = `hi ${foo} thereoh ${bar} hello`; // template literals with expressions
test = `${foo}/${bar}`;

test = `(${foo})`;
test = `(${foo})${bar}`;
test = `(${foo + bar})`;
test = `(${1 + 1})`;

test = `hi${foo}${bar}`;

test = `\${hi}${foo}`; // escaping a string

test = `${foo}hi`;
test = `${foo}hi${bar}`;
test = `${foo}hi${bar}${baz}`;

test = { a: `hi${foo}` }; // in an object
test = [`hi${foo}`]; // in an array

test = +1 + 100;
test = `${+1}100`;
test = +'1' + 100;
test = +'1' + +100;
test = `${+'1'}100`;
test = 1 + +100;
test = 1 + +'100';
test = `1${-100}`; // this could probably be better

test = 1 + 1;
test = 1 - 1;
test = foo + 1;

test = `hi${foo}1`;
test = `hi${foo}` - 1;
test = `hi${foo + 1}`;

test = `hi${foo.join(',')}`; // function

test = `hi${foo.bar}`; // object member
test = `${foo.bar}hi`;
test = `(${foo.bar})`;

test = `${foo + bar}hi`; // foo and bar could be numeric
test = `hi${foo}${bar}`;

test = `foo${bar ? 'bar' : ''}`;

foo(`hi${foo}`);
foo(`${foo}hi`);
foo(`${a}\\?.*${b}`);
