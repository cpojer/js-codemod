/**
 * Replaces string concatenation with template literals.
 * Adapted from https://vramana.github.io/blog/2015/12/21/codemod-tutorial/
 *
 * Areas of improvement:
 *
 * - Better handling of comments when they are in the middle of string
 *   concatenation. Currently, those are simply removed. Perhaps in these
 *   situations, the string concatenation should be preserved as-is.
 *
 * - Collapsing BinaryExpressions that on the left are not concatenation (e.g.
 *   `*`) into expressions within the TemplateLiteral. This would allow 1 - 2 +
 *   'foo' to become `${1 - 2}foo`. We currently just don't touch these
 *   expressions.
 */
module.exports = function templateLiterals(file, api, options) {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || {quote: 'single'};

  function extractNodes(node) {
    if (node.type !== 'BinaryExpression') {
      return [node];
    }

    if (node.operator !== '+') {
      return [node];
    }

    if (node.parenthesizedExpression) {
      return [node];
    }

    if (!isStringishOnLeft(node)) {
      // We need to be careful about not having a stringish node on the left to
      // prevent things like 1 + 2 + 'foo', which should evaluate to '3foo' from
      // becoming '12foo'.
      return [node];
    }

    return [
      ...extractNodes(node.left),
      ...extractNodes(node.right)
    ];
  }

  function isStringNode(node) {
    return node.type === 'Literal' && (typeof node.value === 'string');
  }

  function isTemplateLiteralNode(node) {
    return node.type === 'TemplateLiteral';
  }

  function isBinaryExpressionNode(node) {
    return node.type === 'BinaryExpression';
  }

  function isStringishNode(node) {
    return isStringNode(node) || isTemplateLiteralNode(node);
  }

  function isStringishOnLeft(node) {
    if (isBinaryExpressionNode(node)) {
      if (isBinaryExpressionNode(node.left)) {
        return isStringishOnLeft(node.left);
      } else if (isStringishNode(node.left)) {
        return true;
      } else {
        return isStringishOnLeft(node.right);
      }
    }

    return isStringishNode(node);
  }

  function buildTL(nodes, quasis = [], expressions = [], temp = '') {
    if (nodes.length === 0) {
      // We are done recursing
      const newQuasis = [
        ...quasis,
        j.templateElement({ cooked: temp, raw: temp}, true),
      ];

      return [newQuasis, expressions];
    }

    const [node, ...rest] = nodes;

    if (node.type === 'Literal') {
      let val = node.value;
      if (isStringNode(node)) {
        // Need to escape ${ already used by strings so that we don't introduce
        // new interpolation.
        val = val.replace(/\$\{/, '\\${');
      }
      return buildTL(rest, quasis, expressions, temp + val);
    }

    if (node.type === 'TemplateLiteral') {
      const nodeQuasis = node.quasis.map((q, i) => (
        // If this is the first quasi, we want to prepend the temp value so that
        // it does not get lost. Since there can be multiple quasis, once before
        // and after the expression, we want to only do this on the first one
        // and no others, to prevent the string from repeating.
        j.templateElement({
          cooked: i === 0 ? temp + q.value.cooked : q.value.cooked,
          raw: i === 0 ? temp + q.value.raw : q.value.raw,
        }, false)
      ));

      const newQuasis = quasis.concat(nodeQuasis);
      const newExpressions = expressions.concat(node.expressions);
      return buildTL(rest, newQuasis, newExpressions, '');
    }

    const nextTemplateElement = j.templateElement({ cooked: temp, raw: temp }, false);

    const newQuasis = quasis.concat(nextTemplateElement);
    const newExpressions = expressions.concat(node);

    return buildTL(rest, newQuasis, newExpressions, '');
  }

  function convertToTemplateString(p) {
    const tempNodes = extractNodes(p.node);

    if (!tempNodes.some(isStringishNode)) {
      return p.node;
    }

    const tl = j.templateLiteral(...buildTL(tempNodes));
    if (tl.expressions.length > 0) {
      return tl;
    }

    // There are no expressions, so let's use a regular string.
    const str = tl.quasis.map(q => q.value.raw).join('');
    return j.literal(str);
  }

  return j(file.source)
    .find(j.BinaryExpression, { operator: '+' })
    .replaceWith(convertToTemplateString)
    .toSource(printOptions);
};
