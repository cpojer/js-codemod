function insertSuper(file, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const SuperCallExpression = {
    callee: {
      type: 'Identifier',
      name: 'super'
    }
  };

  const error = (path, msg) =>
    console.error(
      file.path + ':' + path.value.loc.start.line +
      ' – "' + ((path.value.id && path.value.id.name) || 'Unknown') + '" ' +
      msg
    );

  const find = (array, fn) => {
    for (var ii = 0; ii < array.length; ii++) {
      if (fn.call(array, array[ii], ii)) {
        return array[ii];
      }
    }
    return null;
  };

  const isConstructor = property => (
      property.type == 'MethodDefinition' &&
      property.key &&
      property.key.type == 'Identifier' &&
      property.key.name == 'constructor'
    );

  const getConstructor = path =>
    find(path.value.body.body, isConstructor);

  const hasConstructor = path =>
    path.value.body.body.some(isConstructor);

  const findSuperCall = path =>
    path.find(j.CallExpression, SuperCallExpression);

  const findClosestSuperCall = path =>
    path.closest(j.CallExpression, SuperCallExpression);

  const hasSuperClass = path =>
    !!path.value.superClass;

  const getCallArguments = (method, args) => {
    if (method == 'call') {
      return args.slice(1);
    } else if(args[1]) {
      return [j.spreadElement(args[1])];
    } else {
      return [];
    }
  };

  const fixSuperCalls = path =>
    ['call', 'apply'].forEach(method =>
      j(getConstructor(path))
        .find(j.CallExpression, {
          callee: {
            object: {
              name: path.value.superClass.name,
              type: 'Identifier',
            },
            property: {
              name: method,
              type: 'Identifier',
            }
          }
        })
        .forEach(p =>
          j(p).replaceWith(j.callExpression(
            j.identifier('super'),
            getCallArguments(method, p.value.arguments)
          ))
        )
      );

  const hasLazyThisExpressions = thisExpressions => {
    var isLazy = false;
    thisExpressions.forEach(p => {
      isLazy = isLazy || [
        j.ArrowFunctionExpression,
        j.FunctionExpression
      ].some(Expression => {
        const fns = j(p).closest(Expression);
        return (fns.size() > 0 && findClosestSuperCall(fns).size() > 0);
      });
    });
    return isLazy;
  };

  const hasNestedSuperCall = path => {
    const scope = path.closest(j.BlockStatement).get();
    const parent = scope.parentPath.value;
    const grandParent = scope.parentPath.parentPath.value;
    return (
      parent.type != 'FunctionExpression' ||
      grandParent.type != 'MethodDefinition'
    );
  }

  const hasThisExpressionBeforeSuper = constructor => {
    var has = false;
    constructor.value.body.body.some(expression => {
      const thisExpressions = j(expression).find(j.ThisExpression);
      if (thisExpressions.size() > 0) {
        // Check if this expression is a super call and whether `this` was
        // only referred to lazily, because yes, this is something people do.
        has = !hasLazyThisExpressions(thisExpressions);
      }
      return has || findSuperCall(j(expression));
    });
    return has;
  };

  const needsSuperCall = path => {
    const constructor = getConstructor(path);
    const superCalls = findSuperCall(j(constructor));

    if (superCalls.size() === 0) {
      return true;
    } else if (superCalls.size() > 1) {
      error(path, 'has multiple super calls.');
    } else if (hasNestedSuperCall(j(superCalls.get()))) {
      error(path, 'has a super call in a nested block.');
    } else if (hasThisExpressionBeforeSuper(constructor)) {
      error(path, 'has `this` access before its super call.');
    }

    return false;
  };

  const addSuperCall = path =>
    getConstructor(path).value.body.body.unshift(
      j.expressionStatement(
        j.callExpression(
          j.identifier('super'),
          []
        )
      )
    );

  const didTransform = root
    .find(j.ClassDeclaration)
    .filter(hasSuperClass)
    .filter(hasConstructor)
    .forEach(fixSuperCalls)
    .filter(needsSuperCall)
    .forEach(addSuperCall)
    .size() > 0;

  return didTransform ? root.toSource(printOptions) + '\n' : null;
}

module.exports = insertSuper;
