## js-codemod [![Build Status](https://travis-ci.org/cpojer/js-codemod.svg)](https://travis-ci.org/cpojer/js-codemod)

This repository contains a collection of codemod scripts for use with
[JSCodeshift](https://github.com/facebook/jscodeshift).

### Setup & Run

```sh
npm install -g jscodeshift
git clone https://github.com/cpojer/js-codemod.git
jscodeshift -t <codemod-script> <file>
```

Use the `-d` option for a dry-run and use `-p` to print the output for
comparison.

### Included Scripts

#### `arrow-function-arguments`

```sh
jscodeshift -t js-codemod/transforms/arrow-function-arguments.js <file>
```

#### `arrow-function`

Transforms callbacks only when it can guarantee it won't break `this` context in the function. Also transforms `function() { }.bind(this)` calls to `() => {}`.

```sh
jscodeshift -t js-codemod/transforms/arrow-function.js <file>
```

##### Options:

`--inline-single-expressions=true`: If you are feeling lucky and you know that returning the value of single-expression functions will not affect the behavior of your application you can specify the option and it will transform `function() { relay(); }` to `() => relay()` instead of `() => { relay(); }`.

`--max-width=120`: Try the best it can to keep line lengths under the specified length.

#### `invalid-requires`

```sh
jscodeshift -t js-codemod/transforms/invalid-requires.js <file>
```

#### `jest-update`

```sh
jscodeshift -t js-codemod/transforms/jest-update.js <file>
```

#### `no-reassign-params`

Converts functions to not reassign to parameters. This is useful to turn on in conjunction with [Flow's const_params](https://flow.org/en/docs/config/options/#toc-experimental-const-params-boolean) option.

```sh
jscodeshift -t js-codemod/transforms/no-reassign-params.js <file>
```

#### `no-vars`

Conservatively converts `var` to `const` or `let`.

```sh
jscodeshift -t js-codemod/transforms/no-vars.js <file>
```

#### `object-shorthand`

Transforms object literals to use [ES6 shorthand](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#New_notations_in_ECMAScript_2015)
for properties and methods.

```sh
jscodeshift -t js-codemod/transforms/object-shorthand.js <file>
```

#### `outline-require`

```sh
jscodeshift -t js-codemod/transforms/outline-require.js <file>
```

#### `rm-copyProperties`

```sh
jscodeshift -t js-codemod/transforms/rm-copyProperties.js <file>
```

#### `rm-merge`

```sh
jscodeshift -t js-codemod/transforms/rm-merge.js <file>
```

#### `rm-object-assign`

```sh
jscodeshift -t js-codemod/transforms/rm-object-assign.js <file>
```

#### `rm-requires`

Removes any requires where the imported value is not referenced. Additionally
if any module is required more than once the two requires will be merged.

```sh
jscodeshift -t js-codemod/transforms/rm-requires.js <file>
```

#### `template-literals`

Replaces string concatenation with template literals.

```sh
jscodeshift -t js-codemod/transforms/template-literals.js <file>
```

Adapted from ["How to write a codemod" by Ramana Venkata](https://vramana.github.io/blog/2015/12/21/codemod-tutorial/).

Areas of improvement:

- Comments in the middle of string concatenation are currently added before the
  string but after the assignment. Perhaps in these situations, the string
  concatenation should be preserved as-is.

- Nested concatenation inside template literals is not currently simplified.
  Currently, a + `b${'c' + d}` becomes `${a}b${'c' + d}` but it would ideally
  become ``${a}b${`c${d}`}``.

- Unnecessary escaping of quotes from the resulting template literals is
  currently not removed. This is possibly the domain of a different transform.

- Unicode escape sequences are converted to unicode characters when the
  simplified concatenation results in a string literal instead of a template
  literal. It would be nice to perserve the original--whether it be a unicode
  escape sequence or a unicode character.

#### `touchable`

```sh
jscodeshift -t js-codemod/transforms/touchable.js <file>
```

#### `trailing-commas`

Adds trailing commas to array and object literals.

```sh
jscodeshift -t js-codemod/transforms/trailing-commas.js <file>
```

#### `unchain-variables`

Unchains chained variable declarations.

```sh
jscodeshift -t js-codemod/transforms/unchain-variables.js <file>
```

#### `underscore-to-lodash-native`

Replaces underscore (or lodash) to ES6 + lodash, preferring native ES6 array methods. Member imports are used by default to allow tree-shaking, but the `--split-imports=true` option will split each lodash import into its own `lodash/<method>` import.

```sh
jscodeshift -t js-codemod/transforms/underscore-to-lodash-native.js <file>
```

#### `unquote-properties`

Removes quotes from object properties whose keys are strings which are valid
identifiers.

```sh
jscodeshift -t js-codemod/transforms/unquote-properties.js <file>
```

#### `updated-computed-props`

```sh
jscodeshift -t js-codemod/transforms/updated-computed-props.js <file>
```

#### `use-strict`

Adds a top-level `'use strict'` statement to JavaScript files

```sh
jscodeshift -t js-codemod/transforms/use-strict.js <file>
```


### Included extensions

`jscodeshift-imports` helpers for modifying `import` and `require` statements,
[see docs](extensions/imports/).

### Recast Options

[Options to recast's printer](https://github.com/benjamn/recast/blob/master/lib/options.ts) can be provided
through the `printOptions` command line argument

```sh
jscodeshift -t transform.js <file> --printOptions='{"quote":"double"}'
```
