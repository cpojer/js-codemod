'use strict';

const StringUtils = require('nuclide-format-js/lib/common/utils/StringUtils');
const getDeclarationName = require('../utils/getDeclarationName');
const isGlobal = require('nuclide-format-js/lib/common/utils/isGlobal');
const isValidRequireDeclaration = require('../utils/isValidRequireDeclaration');
const jscs = require('jscodeshift');

module.exports = [
  // Handle general requires, e.g: `require('lowerCase');`
  {
    searchTerms: [jscs.VariableDeclaration],
    filters: [
      isGlobal,
      path => isValidRequireDeclaration(path.node),
    ],
    comparator: (node9, nodeg) => StringUtils.compareStrings(
      getDeclarationName(node9),
      getDeclarationName(nodeg)
    ),
  },
];
