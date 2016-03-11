'use strict';

const addImport = require('./addImport');
const CJSBasicRequireConfig = require('./config/CJSBasicRequireConfig');
const FBRequireConfig = require('./config/FBRequireConfig');

module.exports = {
  register(jscodeshift, config) {
    const plugins = this.createPlugins(config);
    jscodeshift.registerMethods(plugins);
  },

  createPlugins(config) {
    return {

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
    };
  },

  config: {
    CJSBasicRequire: CJSBasicRequireConfig,
    FBRequire: FBRequireConfig,
  },
};
