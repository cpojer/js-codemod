module.exports = (file, api, options) => {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const getBodyStatement = fn => {
    // 79 characters fit on a line of length 80
    const maxWidth = options['max-width'] ? options['max-width'] - 1 : undefined;

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
        const lineStart = fn.loc.start.line;
        const originalLineLength = fn.loc.lines.getLineLength(lineStart);
        const approachDifference = 'function(a, b) {'.length - '(a, b) => );'.length;
        const argumentLength = inner.argument.end - inner.argument.start;

        const newLength = originalLineLength + argumentLength - approachDifference;
        const tooLong = maxWidth && newLength > maxWidth;

        if (!tooLong) {
          return inner.argument;
        }
      }
    }
    return fn.body;
  };

  const createArrowFunctionExpression = fn => j.arrowFunctionExpression(
    fn.params,
    getBodyStatement(fn),
    false
  );

  const replacedBoundFunctions = root
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

  const replacedCallbacks = root
    .find(j.FunctionExpression)
    .filter(path => {
      const isArgument = path.parentPath.name === 'arguments' && path.parentPath.value.indexOf(path.value) > -1;
      const noThis = j(path).find(j.ThisExpression).size() == 0;
      const notNamed = !path.value.id || !path.value.id.name;

      return isArgument && noThis && notNamed;
    })
    .forEach(path =>
      j(path).replaceWith(
        createArrowFunctionExpression(path.value)
      )
    )
    .size() > 0;

  return replacedBoundFunctions || replacedCallbacks ? root.toSource(printOptions) : null;
};
