## js-codemod [![Build Status](https://travis-ci.org/cpojer/js-codemod.svg)](https://travis-ci.org/cpojer/js-codemod)

This repository contains a collection of codemod scripts for use with
[JSCodeshift](https://github.com/facebook/jscodeshift).

### Setup & Run

  * `npm install -g jscodeshift`
  * `git clone https://github.com/cpojer/js-codemod.git`
  * `jscodeshift -t <codemod-script> <file>`
  * Use the `-d` option for a dry-run and use `-p` to print the output
    for comparison

### Included Scripts

`use-strict` adds a top-level `'use strict'` statement to JavaScript files

  * `jscodeshift -t js-codemod/transforms/use-strict.js <file>`

`arrow-function` transforms functions to arrow functions

  * `jscodeshift -t js-codemod/transforms/arrow-function.js <file>`

It will transform `function() { }.bind(this)` calls to `() => {}`. If the only
statement in the body is a `ReturnStatement` it will remove the curly braces.
If you are feeling lucky and you know that returning the value of
single-expression functions will not affect the behavior of your application you
can specify the `--inline-single-expressions=true` option and it will transform
`function() { relay(); }.bind(this)` to `() => relay()` instead of
`() => { relay(); }`.

### Recast Options

Options to [recast](https://github.com/benjamn/recast)'s printer can be provided
through the `printOptions` command line argument

 * `jscodeshift -t transform.js <file> --printOptions='{"quote":"double"}'`
