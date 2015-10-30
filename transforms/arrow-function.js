module.exports = (file, api, options) => {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const getBodyStatement = fn => {
    if (
      fn.body.type == 'BlockStatement' &&
      fn.body.body.length == 1
    ) {
      const inner = fn.body.body[0];
      if (
        options['inline-single-expressions'] &&
        inner.type == 'ExpressionStatement'
      ) {
        return inner.expression;
      } else if (inner.type == 'ReturnStatement') {
        return inner.argument;
      }
    }
    return fn.body;
  };

  const createArrowFunctionExpression = fn => j.arrowFunctionExpression(
    fn.params,
    getBodyStatement(fn),
    false
  );

  const didTransform = root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'FunctionExpression',
        },
        property: {
          type: 'Identifier',
          name: 'bind',
        },
      },
    })
    .filter(path => (
      !path.value.callee.object.id &&
      path.value.arguments &&
      path.value.arguments.length == 1 &&
      path.value.arguments[0].type == 'ThisExpression'
    ))
    .forEach(path =>
      j(path).replaceWith(
        createArrowFunctionExpression(path.value.callee.object)
      )
    )
    .size() > 0;

  return didTransform ? root.toSource(printOptions) : null;
};
