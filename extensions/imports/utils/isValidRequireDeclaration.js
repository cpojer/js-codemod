'use strict';

const jscs = require('jscodeshift');
const hasOneRequireDeclaration = require('nuclide-format-js-base/lib/utils/hasOneRequireDeclaration');

function isValidRequireDeclaration(node) {
  if (!hasOneRequireDeclaration(node)) {
    return false;
  }
  var declaration = node.declarations[0];
  if (jscs.Identifier.check(declaration.id)) {
    return true;
  }
  if (jscs.ObjectPattern.check(declaration.id)) {
    return declaration.id.properties.every(
      prop => prop.shorthand && jscs.Identifier.check(prop.key)
    );
  }
  if (jscs.ArrayPattern.check(declaration.id)) {
    return declaration.id.elements.every(
      element => jscs.Identifier.check(element)
    );
  }
  return false;
}

module.exports = isValidRequireDeclaration;
