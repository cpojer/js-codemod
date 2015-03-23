## js-codemod

This repository is a collection of codemod scripts based on
[JSCodeshift](https://github.com/facebook/jscodeshift).

### Setup & Run

  * `npm install`
  * `./jscodeshift -t <codemod-script> <file>`
  * Use the `-d` option for a dry-run and use `-p` to print the output
    for comparison

### Included Scripts

`use-strict.js` adds a top-level `'use strict'` statement to JavaScript files

  * `./jscodeshift -t build/use-strict.js <file>`
