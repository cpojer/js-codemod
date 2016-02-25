## jscodeshift-imports extension

A [JSCodeshift](https://github.com/facebook/jscodeshift) extension which
contains helpers for modifying `import` and `require` statements.

### Setup

Install extension: `npm install jscodeshift-imports`.

Register the extension with jscodeshift:
```javascript
const imports = require('jscodeshift-imports');

module.exports = function(fileInfo, api) {
  const {jscodeshift} = api;

  imports.register(jscodeshift, imports.config.CJSBasicRequire);

  // Your transform here.
}
```

Different configs will be needed based on your code style, this extension comes
with two default configs:
 - [Basic commonJS style](config/CJSBasicRequireConfig.js), all requires in one
block.
 - [Facebook style](config/FBRequireConfig.js), requires are split by the case
of the module's name.

You can also provide your own custom config.

### API

#### `addImport`

This helper allows you to insert require statements into the most appropriate
place within a file, it does this in a non destructive way so your codemod will
change as little in the file as it can.

Usage:
```javascript
const imports = require('jscodeshift-imports');

module.exports = function(fileInfo, api) {
  const {jscodeshift} = api;
  const {statement} = jscodeshift.template;

  imports.register(jscodeshift, imports.config.CJSBasicRequire);

  return jscodeshift(file.source)
    .addImport(statement`
      const MyRequireItem = require('MyRequireItem');
    `)
    .toSource();
}
```

`addImport` accepts any `require` or `import` statement as long as it matches
one of the config types.

**Note:** This transform cannot be trusted. Whilst this implementation works
in most cases it can give incorrect whitespace due to limitations in the AST.
You will need to manually verify the output after running.
