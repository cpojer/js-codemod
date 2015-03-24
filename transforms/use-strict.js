function addUseStrict(file, api, options) {
  var j = api.jscodeshift;

  function hasStrictMode(body) {
    return body.some(
      statement => j.match(statement, {
        type: 'ExpressionStatement',
        expression: {
          type: 'Literal',
          value: 'use strict',
        },
      })
    );
  }

  function withComments(expression, node) {
    expression.comments = node.comments;
    return expression;
  }

  function createUseStrictExpression() {
    return j.expressionStatement(
      j.literal('use strict')
    );
  }

  var root = j(file.source);
  var body = root.get().value.body;

  if (!body.length || hasStrictMode(body)) {
    return null;
  }

  body.unshift(withComments(createUseStrictExpression(), body[0].comments));
  body[0].comments = body[1].comments;
  delete body[1].comments;

  return root.toSource(options && options.printOptions);
};

module.exports = addUseStrict;
