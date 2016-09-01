'use strict';

const makeAddImport = require('./addImport');
const CJSBasicRequireConfig = require('./config/CJSBasicRequireConfig');
const FBRequireConfig = require('./config/FBRequireConfig');

/**
 * Create extension. Takes a config fn and returns a `use`-able plugin fn.
 *
 * Usage:
 *   jscodeshift.use(imports(imports.config.CJSBasicRequire));
 */
 function imports(makeConfig) {
  makeConfig = makeConfig || CJSBasicRequireConfig;

  return function importsPlugin(jscodeshift) {
    const config = makeConfig(jscodeshift);
    const addImport = makeAddImport(jscodeshift);

    jscodeshift.registerMethods({
      /**
       * Add a new import statement.
       *
       * Usage:
       *
       *   jscodeshift(file.source)
       *     .addImport(statement`
       *       import MyImportItem from './path/to/MyImportItem';
       *     `);
       */
      addImport(importStatement) {
        return this.forEach(path => {
          addImport(config, path, importStatement);
        });
      },
    })
  }
};

imports.config = {
  CJSBasicRequire: CJSBasicRequireConfig,
  FBRequire: FBRequireConfig,
};

module.exports = imports;
