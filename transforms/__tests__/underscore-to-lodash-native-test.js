'use strict';

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const printOptions = {
  quote: 'single',
};
defineTest(__dirname, 'underscore-to-lodash-native', {printOptions});
