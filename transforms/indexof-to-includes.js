// Convert code like
//
//   foo.indexOf(bar) > -1
//
// to
//
//   foo.includes(bar)

function isAlreadyNegated(path) {
  return path.node.left.type === 'UnaryExpression';
}

function shouldBeNotIncludes(path) {
  const operator = path.node.operator;

  if (path.node.right.type === 'UnaryExpression') {
    // negative
    const value = path.node.right.argument.value;

    if (operator === '===' && value === 1) {
      return !isAlreadyNegated(path);
    }

    if (operator === '==' && value === 1) {
      return !isAlreadyNegated(path);
    }

    if (operator === '<=' && value === 1) {
      return !isAlreadyNegated(path);
    }
  } else {
    // not negative
    const value = path.node.right.value;

    if (operator === '<' && value === 0) {
      return !isAlreadyNegated(path);
    }
  }

  return isAlreadyNegated(path);
}

export default function transformer(file, api, options) {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || { quote: 'single' };

  const root = j(file.source);

  // Find expressions like foo.indexOf() > 0
  const indexOfs = root
    .find(j.BinaryExpression)
    .filter(path => (
      (
        path.node.left.type === 'CallExpression'
        && path.node.left.callee.type === 'MemberExpression'
        && path.node.left.callee.property.name === 'indexOf'
      ) || (
        path.node.left.type === 'UnaryExpression'
        && path.node.left.argument.type === 'CallExpression'
        && path.node.left.argument.callee.type === 'MemberExpression'
        && path.node.left.argument.callee.property.name === 'indexOf'
      )
    ))
    .filter(path => (
      (
        // not negative
        path.node.right.type === 'Literal'
        && path.node.operator !== '=='
        && path.node.operator !== '==='
        && path.node.right.value === 0
      ) || (
        // negative
        path.node.right.type === 'UnaryExpression'
        && path.node.right.argument.type === 'Literal'
        && path.node.right.argument.value === 1
      )
    ));

  if (!indexOfs.length) {
    return undefined;
  }

  indexOfs.forEach((path) => {
    const callExpression = path.node.left.type === 'UnaryExpression'
      ? path.node.left.argument
      : path.node.left;

    let includes = j.callExpression(
      j.memberExpression(
        callExpression.callee.object,
        j.identifier('includes')
      ),
      callExpression.arguments
    );

    if (shouldBeNotIncludes(path)) {
      includes = j.unaryExpression('!', includes);
    }

    j(path).replaceWith(includes);
  });

  return root.toSource(printOptions);
}
