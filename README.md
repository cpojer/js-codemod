## js-codemod

This repository contains a collection of codemod scripts based on
[JSCodeshift](https://github.com/facebook/jscodeshift).

### Setup & Run

  * `npm install -g js-codemod`
  * `js-codemod <codemod-script> <file>`
  * Use the `-d` option for a dry-run and use `-p` to print the output
    for comparison

### Included Scripts

`use-strict.js` adds a top-level `'use strict'` statement to JavaScript files

  * `js-codemod use-strict <file>`

`arrow-function.js` transforms functions to arrow functions

  * `js-codemod arrow-function <file>`

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

 * `js-codemod use-strict <file> --printOptions='{"quote":"double"}'`
