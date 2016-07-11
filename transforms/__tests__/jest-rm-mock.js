'use strict';

const defineTest = require('jscodeshift/dist/testUtils').defineTest;
defineTest(
  __dirname,
  'jest-rm-mock',
  {
    moduleNames: ['cx', 'ix'],
  },
  '__tests__/jest-rm-mock'
);
