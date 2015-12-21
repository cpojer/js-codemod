/**
 * Simplifies object properties in object literals to use ES6 shorthand notation.
 *
 * This handles properties and methods, as well as properties which use literals as keys.
 *
 * e.g.
 *
 * var object = {
 *  identifier: identifier,
 *  'identifier2': identifier2,
 *  method: function() {}
 * }
 *
 * becomes:
 *
 * var object = {
 *  identifier,
 *  identifier2,
 *  method() {}
 * }
 */
module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const canBeSimplified = (key, value) => {
    // Can be simplified if both key and value are the same identifier or if the
    // property is a method.
    if (key.type === 'Identifier') {
      return (
          value.type === 'Identifier' &&
          key.name === value.name
        ) ||
        value.type === 'FunctionExpression';
    }

    // Can be simplified if the key is a string literal which is equal to the
    // identifier name of the value.
    if (key.type === 'Literal') {
      return value.type === 'Identifier' && key.value === value.name;
    }

    return false;
  };

  root
    .find(j.Property, {
      method: false,
      shorthand: false,
      computed: false,
    })
    .filter(p => canBeSimplified(p.value.key, p.value.value))
    .forEach(p => {
      if (p.value.key.type === 'Literal') {
        p.value.key = p.value.value;
      }

      if (p.value.value.type === 'Identifier') {
        p.value.shorthand = true;
      } else if (p.value.value.type === 'FunctionExpression') {
        p.value.method = true;
      }
    });

  return root.toSource(printOptions);
};
