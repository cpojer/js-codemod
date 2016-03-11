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
const plugins = imports.createPlugins(imports.config.FBRequire);
jscodeshift.registerMethods({
  addFBImport: plugins.addImport,
});

describe('addImportFBConfig', () => {
  it('should add to block start large', () => {
    const jfile = jscodeshift(`
      var A1 = require('A1');
      var A3 = require('A3');

      var a1 = require('a1');

      aaa;
    `)
    .addFBImport(statement`
      var A0 = require('A0');
    `);

    test(jfile, `
      var A0 = require('A0');
      var A1 = require('A1');
      var A3 = require('A3');

      var a1 = require('a1');

      aaa;
    `);
  });
  it('should add to block start small', () => {
    const jfile = jscodeshift(`
      var A1 = require('A1');
      var A3 = require('A3');

      var a1 = require('a1');

      aaa;
    `)
    .addFBImport(statement`
      var a0 = require('a0');
    `);

    test(jfile, `
      var A1 = require('A1');
      var A3 = require('A3');

      var a0 = require('a0');
      var a1 = require('a1');

      aaa;
    `);
  });

  it('should add to block middle', () => {
    const jfile = jscodeshift(`
      var A1 = require('A1');
      var A3 = require('A3');

      var a1 = require('a1');
      var a3 = require('a3');

      aaa;
    `)
    .addFBImport(statement`
      var a2 = require('a2');
    `);

    test(jfile, `
      var A1 = require('A1');
      var A3 = require('A3');

      var a1 = require('a1');
      var a2 = require('a2');
      var a3 = require('a3');

      aaa;
    `);
  });

  it('should create small block if it doesnt exist', () => {
    const jfile = jscodeshift(`
      /* @flow */

      'use strict';

      var A1 = require('A1');

      aaa;
    `)
    .addFBImport(statement`
      var a2 = require('a2');
    `);

    test(jfile, `
      /* @flow */

      'use strict';

      var A1 = require('A1');

      var a2 = require('a2');

      aaa;
    `);
  });

  it('should create large block if it doesnt exist', () => {
    const jfile = jscodeshift(`
      /* @flow */

      'use strict';

      var a2 = require('a2');

      aaa;
    `)
    .addFBImport(statement`
      var A1 = require('A1');
    `);

    test(jfile, `
      /* @flow */

      'use strict';

      var A1 = require('A1');

      var a2 = require('a2');

      aaa;
    `);
  });

  // TODO: Get the whitespace to display correctly in this case.
  // it('should add more that one', () => {
  //   const jfile = jscodeshift(`
  //     /* @flow */
  //
  //     'use strict';
  //
  //     var A1 = require('A1');
  //
  //     aaa;
  //   `)
  //   .addFBImport(statement`
  //     var A0 = require('A0');
  //   `)
  //   .addFBImport(statement`
  //     var a2 = require('a2');
  //   `)
  //   .addFBImport(statement`
  //     var A3 = require('A3');
  //   `);
  //
  //   test(jfile, `
  //     /* @flow */
  //
  //     'use strict';
  //
  //     var A0 = require('A0');
  //     var A1 = require('A1');
  //     var A3 = require('A3');
  //
  //     var a2 = require('a2');
  //
  //     aaa;
  //   `);
  // });
});
