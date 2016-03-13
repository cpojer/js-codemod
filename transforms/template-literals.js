/**
 * Replaces string concatenation with template literals.
 * Adapted from https://vramana.github.io/blog/2015/12/21/codemod-tutorial/
 *
 * Areas of improvement:
 *
 * - Better handling of comments when they are in the middle of string
 *   concatenation. Currently, those are added before the string but after the
 *   assignment. Perhaps in these situations, the string concatenation should be
 *   preserved as-is.
 *
 * - Better handling of code like 1 + 2 + 'foo' + bar which would ideally become
 *   `${1 + 2}foo${bar}`.
 *
 * - Better handling of nested string concatenation inside template literals.
 *   Currently, a + `b${'c' + d}` becomes `${a}b${'c' + d}` but it would ideally
 *   become `${a}b${`c${d}`}`.
 */
module.exports = function templateLiterals(file, api, options) {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || {quote: 'single'};

  function extractNodes(node, comments, topLevel = false) {
    if (comments) {
      node.comments = node.comments || [];
      node.comments.push(...comments);
    }

    if (node.type !== 'BinaryExpression') {
      return [node];
    }

    if (node.operator !== '+') {
      return [node];
    }

    if (!topLevel && node.parenthesizedExpression) {
      return [node];
    }

    if (!isStringishOnLeft(node)) {
      // We need to be careful about not having a stringish node on the left to
      // prevent things like 1 + 2 + 'foo', which should evaluate to '3foo' from
      // becoming '12foo'.
      return [node.left, node.right];
    }

    return [
      ...extractNodes(node.left),
      ...extractNodes(node.right, node.comments),
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

  function joinQuasis(leftQuasis, rightQuasis) {
    const lastQuasi = leftQuasis.pop();

    if (lastQuasi) {
      rightQuasis[0] = j.templateElement({
        cooked: lastQuasi.value.cooked + rightQuasis[0].value.cooked,
        raw: lastQuasi.value.raw + rightQuasis[0].value.raw,
      }, false);
    }

    return leftQuasis.concat(rightQuasis);
  }

  function buildTL(nodes, quasis = [], expressions = [], comments = []) {
    if (nodes.length === 0) {
      return { quasis, expressions, comments };
    }

    const [node, ...rest] = nodes;

    const newComments = comments.concat(node.comments || []);

    if (node.type === 'Literal') {
      const cooked = node.value.toString();
      // For the raw string, we need to escape \ and ${ so that we don't that
      // we don't introduce new interpolation.
      const raw = cooked.replace(/(\$\{|\\)/, '\\$1');
      const newQuasi = j.templateElement({ cooked, raw }, false);
      const newQuasis = joinQuasis(quasis, [newQuasi]);
      return buildTL(rest, newQuasis, expressions, newComments);
    }

    if (node.type === 'TemplateLiteral') {
      const nodeQuasis = node.quasis.map((q) => (
        j.templateElement({
          cooked: q.value.cooked,
          raw: q.value.raw,
        }, false)
      ));

      // We need to join the last quasi and the next quasi to prevent
      // expressions from shifting.
      const newQuasis = joinQuasis(quasis, nodeQuasis);
      const newExpressions = expressions.concat(node.expressions);
      return buildTL(rest, newQuasis, newExpressions, newComments);
    }

    const newQuasis = joinQuasis(quasis, [
      j.templateElement({ cooked: '', raw: '' }, false),
      j.templateElement({ cooked: '', raw: '' }, false),
    ]);
    const newExpressions = expressions.concat(node);

    return buildTL(rest, newQuasis, newExpressions, newComments);
  }

  function convertToTemplateString(p) {
    const tempNodes = extractNodes(p.node, null, true);

    if (!tempNodes.some(isStringishNode)) {
      return p.node;
    }

    const tlOptions = buildTL(tempNodes);
    const tl = j.templateLiteral(tlOptions.quasis, tlOptions.expressions);
    if (tl.expressions.length > 0) {
      tl.comments = tlOptions.comments;
      return tl;
    }

    // There are no expressions, so let's use a regular string instead of a
    // template literal.
    const str = tl.quasis.map(q => q.value.raw).join('');
    const strLiteral = j.literal(str);
    strLiteral.comments = tlOptions.comments;
    return strLiteral;
  }

  return j(file.source)
    .find(j.BinaryExpression, { operator: '+' })
    .replaceWith(convertToTemplateString)
    .toSource(printOptions);
};
