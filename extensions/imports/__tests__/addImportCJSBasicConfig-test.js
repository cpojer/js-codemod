'use strict';

jest.autoMockOff();

const jscodeshift = require('jscodeshift');
const imports = require('../index');

const statement = jscodeshift.template.statement;

const DEFAULT_RECAST_CONFIG = {
  quote: 'single',
  trailingComma: true,
  tabWidth: 2,
};

function test(inputCollection, output) {
  expect(
    (inputCollection.toSource(DEFAULT_RECAST_CONFIG) || '').trim()
  ).toEqual(
    (output || '').trim()
  );
}

// Setup JSCodeShift
const plugins = imports.createPlugins(imports.config.CJSBasicRequire);
jscodeshift.registerMethods({
  addBasicImport: plugins.addImport,
});

describe('addImportCJSBasicConfig', () => {
  it('should add to block start', () => {
    const jfile = jscodeshift(`
      var A1 = require('A1');
      var A3 = require('A3');

      aaa;
    `)
    .addBasicImport(statement`
      var A0 = require('A0');
    `);

    test(jfile, `
      var A0 = require('A0');
      var A1 = require('A1');
      var A3 = require('A3');

      aaa;
    `);
  });

  it('should add to block middle', () => {
    const jfile = jscodeshift(`
      var A1 = require('A1');
      var A3 = require('A3');

      aaa;
    `)
    .addBasicImport(statement`
      var A2 = require('A2');
    `);

    test(jfile, `
      var A1 = require('A1');
      var A2 = require('A2');
      var A3 = require('A3');

      aaa;
    `);
  });

  it('should add to block end', () => {
    const jfile = jscodeshift(`
      var A1 = require('A1');
      var A3 = require('A3');

      aaa;
    `)
    .addBasicImport(statement`
      var A4 = require('A4');
    `);

    test(jfile, `
      var A1 = require('A1');
      var A3 = require('A3');
      var A4 = require('A4');

      aaa;
    `);
  });

  // TODO: Comments mess with the whitespace output, fix this.
  // it('should add and maintain comments', () => {
  //   const jfile = jscodeshift(`
  //     /* @flow */
  //
  //     var A1 = require('A1');
  //     var A3 = require('A3');
  //
  //     aaa;
  //   `)
  //   .addBasicImport(statement`
  //     var A0 = require('A0');
  //   `);
  //
  //   test(jfile, `
  //     /* @flow */
  //
  //     var A0 = require('A0');
  //     var A1 = require('A1');
  //     var A3 = require('A3');
  //
  //     aaa;
  //   `);
  // });

  it('should add to a non first statement', () => {
    const jfile = jscodeshift(`
      /* @flow */

      'use strict';

      var A1 = require('A1');
      var A3 = require('A3');

      aaa;
    `)
    .addBasicImport(statement`
      var A0 = require('A0');
    `);

    test(jfile, `
      /* @flow */

      'use strict';

      var A0 = require('A0');
      var A1 = require('A1');
      var A3 = require('A3');

      aaa;
    `);
  });

  // TODO: We should check the `node.loc` to see if there is >1 line between
  // each require, we should only consider the first set of requires that have
  // no newlines between each other.
  // it('should not touch any other blocks', () => {
  //   const jfile = jscodeshift(`
  //     /* @flow */
  //
  //     'use strict';
  //
  //     var A1 = require('A1');
  //     var A3 = require('A3');
  //
  //     var A4 = require('A4');
  //
  //     aaa;
  //   `)
  //   .addBasicImport(statement`
  //     var A5 = require('A5');
  //   `);
  //
  //   test(jfile, `
  //     /* @flow */
  //
  //     'use strict';
  //
  //     var A1 = require('A1');
  //     var A3 = require('A3');
  //     var A5 = require('A5');
  //
  //     var A4 = require('A4');
  //
  //     aaa;
  //   `);
  // });

  it('should not touch other any other scopes', () => {
    const jfile = jscodeshift(`
      /* @flow */

      'use strict';

      var A1 = require('A1');
      var A3 = require('A3');
      if (true) {
        var A4 = require('A4');
      }

      aaa;
    `)
    .addBasicImport(statement`
      var A5 = require('A5');
    `);

    test(jfile, `
      /* @flow */

      'use strict';

      var A1 = require('A1');
      var A3 = require('A3');
      var A5 = require('A5');
      if (true) {
        var A4 = require('A4');
      }

      aaa;
    `);
  });

  it('should create block if it doesnt exist', () => {
    const jfile = jscodeshift(`
      /* @flow */

      aaa;
    `)
    .addBasicImport(statement`
      var A1 = require('A1');
    `);

    test(jfile, `
      /* @flow */

      var A1 = require('A1');

      aaa;
    `);
  });

  it('should create block if it doesnt exist (use strict)', () => {
    const jfile = jscodeshift(`
      /* @flow */

      'use strict';

      aaa;
    `)
    .addBasicImport(statement`
      var A1 = require('A1');
    `);

    test(jfile, `
      /* @flow */

      'use strict';

      var A1 = require('A1');

      aaa;
    `);
  });

  it('should add more that one', () => {
    const jfile = jscodeshift(`
      /* @flow */

      'use strict';

      var A1 = require('A1');

      aaa;
    `)
    .addBasicImport(statement`
      var A0 = require('A0');
    `)
    .addBasicImport(statement`
      var A2 = require('A2');
    `)
    .addBasicImport(statement`
      var A3 = require('A3');
    `);

    test(jfile, `
      /* @flow */

      'use strict';

      var A0 = require('A0');
      var A1 = require('A1');
      var A2 = require('A2');
      var A3 = require('A3');

      aaa;
    `);
  });
});
