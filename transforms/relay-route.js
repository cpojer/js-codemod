function relayRoute(file, api, options) {
  const j = api.jscodeshift;

  require('./utils/array-polyfills');
  const ReactUtils = require('./utils/ReactUtils')(j);

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const DliteRouteCreateMemberExpression = {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'DliteRoute',
    },
    property: {
      type: 'Identifier',
      name: 'create',
    },
  };

  const getBodyStatement = fn => {
    if (
      fn.body.type === 'BlockStatement' &&
      fn.body.body.length === 1
    ) {
      const inner = fn.body.body[0];
      if (inner.type === 'ReturnStatement') {
        return inner.argument;
      }
    }
    return fn.body;
  };

  const createRequireAssignment = moduleName =>
    j.variableDeclarator(
      j.identifier(moduleName),
      j.callExpression(
        j.identifier('require'),
        [j.literal(moduleName)]
      )
    );

  const getName = path => {
    var name = null;
    var property = path.value.arguments[0].properties.find(property =>
      property.key &&
      property.key.type === 'Identifier' &&
      property.key.name === 'name'
    );
    if (property) {
      name = property.value.value;
    }

    var declarator = j(path).closest(j.VariableDeclarator).get();
    if (
      declarator &&
      declarator.value.id &&
      declarator.value.id.type === 'Identifier'
    ) {
      if (name != declarator.value.id.name) {
        throw new Error(
          'DliteRoute name ' + name + ' does not match variable name ' +
          declarator.value.id.name
        );
      }
    }

    return name;
  };

  const findDliteRouteCreateExpressions = root =>
    root
      .find(j.CallExpression, {
        callee: DliteRouteCreateMemberExpression
      });

  const createClassDeclaration = name =>
    j.classDeclaration(
      j.identifier(name),
      j.classBody([]),
      j.memberExpression(
        j.identifier('Relay'),
        j.identifier('Route'),
        false
      )
    );

  const fixQuery = (keyName, value) => {
    if (keyName != 'queries') {
      return value;
    }
    value.properties.forEach(property =>
      [j.ArrowFunctionExpression, j.FunctionExpression].forEach(Expression => {
        j(property)
          .find(Expression)
          .filter(p => (
            p.value.params.length === 3 &&
            p.value.params[0].name === 'value' &&
            p.value.params[1].name === 'childQuery'
          ))
          .forEach((p) => {
            j(p.value.body)
              .find(j.Identifier, {
                name: p.value.params[2].name
              })
              .forEach(p => j(p).replaceWith(j.identifier('rql')));

            j(p.value.body)
              .find(j.Identifier, {
                name: 'childQuery'
              })
              .forEach(p =>
                j(p)
                .replaceWith(
                  j.callExpression(
                    j.memberExpression(
                      j.identifier('Component'),
                      j.identifier('getQuery'),
                      false
                    ),
                    [j.literal(property.key.name)]
                  )
                )
              );

            j(p.value.body)
              .find(j.Identifier, {
                name: 'value'
              })
              .forEach(p => j(p).replaceWith(
                j.memberExpression(
                  j.identifier('params'),
                  j.identifier(property.key.name),
                  false
                )
              ));

            j(p).replaceWith(j.arrowFunctionExpression(
              [
                j.identifier('Component'),
                j.identifier('params'),
                j.identifier('rql')
              ],
              getBodyStatement(p.value)
            ));
          });
      })
    );

    return value;
  };

  const createAssignmentExpression = (name, key, value) =>
    j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.memberExpression(
          j.identifier(name),
          key,
          false
        ),
        fixQuery(key.name, value)
      )
    );

  const createAssignmentExpressions = (name, properties) =>
    properties
      .filter(property => !(
        property.key &&
        property.key.type === 'Identifier' &&
        property.key.name === 'name'
      ))
      .filter(property => !(
        property.value.type === 'ObjectExpression' &&
        property.value.properties.length === 0
      ))
      .map(property => createAssignmentExpression(
        name,
        property.key,
        property.value
      ));

  const updateToRelayRoute = path => {
    var p = j(path).closest(j.VariableDeclaration);
    var name;
    try {
      name = getName(path);
    } catch (e) {
      console.error(e.message);
      return;
    }

    if (p.find(j.VariableDeclarator).size() > 1) {
      console.error(
        'Cannot update ' + name + ' because it is defined among other ' +
        'variables.'
      );
      return;
    }

    p = p.replaceWith(createClassDeclaration(name));

    createAssignmentExpressions(name, path.value.arguments[0].properties)
      .reverse()
      .forEach(expression => p.insertAfter(expression));

    p = p.insertAfter(
      createAssignmentExpression(
        name,
        j.identifier('routeName'),
        j.literal(name)
      )
    );
  };

  if (!ReactUtils.hasModule(root, 'DliteRoute')) {
    return null;
  }

  const didTransform = findDliteRouteCreateExpressions(root)
    .forEach(updateToRelayRoute)
    .size() > 0;

  if (didTransform) {
    root
      .findVariableDeclarators()
      .filter(p => p.value.id.name === 'DliteRoute')
      .forEach(p => j(p).replaceWith(createRequireAssignment('Relay')));
  }

  return didTransform ? root.toSource(printOptions) + '\n' : null;
}

module.exports = relayRoute;
