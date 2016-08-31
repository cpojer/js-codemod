/**
 * This removes the describe block when there's only one.
 *
 * Convert
 * 
 * describe("Name", function() {
 *   it(...);
 *   ...
 * });
 *
 * into
 *
 * it(...);
 * ...
 *
 */

export default function transformer(file, api) {
  const j = api.jscodeshift;

  var describes = j(file.source)
    .find(j.ExpressionStatement)
    .filter(path =>
            path.parentPath.node.type === 'Program' &&
            path.node.expression.type === 'CallExpression' &&
            path.node.expression.callee.type === 'Identifier' &&
            path.node.expression.callee.name === 'describe');

  if (describes.size() !== 1) {
    return null;
  }

  describes.forEach(path => {
    if (path.parentPath.node.type !== 'Program') {
      return;
    }
    var parentBody = path.parentPath.node.body;
    parentBody.splice(
      parentBody.indexOf(path.node),
      1,
      ...path.node.expression.arguments[1].body.body
    );
  });

  return describes.toSource();
}
