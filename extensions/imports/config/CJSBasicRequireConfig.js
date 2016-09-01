'use strict';

const StringUtils = require('nuclide-format-js-base/lib/utils/StringUtils');
const getDeclarationName = require('../utils/getDeclarationName');
const isGlobal = require('nuclide-format-js-base/lib/utils/isGlobal');
const isValidRequireDeclaration = require('../utils/isValidRequireDeclaration');

module.exports = jscs => [
  // Handle general requires, e.g: `require('lowerCase');`
  {
    searchTerms: [jscs.VariableDeclaration],
    filters: [
      isGlobal,
      path => isValidRequireDeclaration(jscs, path.node),
    ],
    comparator: (node1, node2) => StringUtils.compareStrings(
      getDeclarationName(jscs, node1),
      getDeclarationName(jscs, node2)
    ),
  },
];
