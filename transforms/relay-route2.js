function relayRouteName(file, api, options) {
  const j = api.jscodeshift;

  require('./utils/array-polyfills');
  const ReactUtils = require('./utils/ReactUtils')(j);

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const findRelayRoutes = root =>
    root.find(j.ClassDeclaration, {
      superClass: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'Relay',
        },
        property: {
          type: 'Identifier',
          name: 'Route',
        },
      },
    });

  const createAssignmentExpression = (name, fieldName) =>
    j.expressionStatement(
      j.assignmentExpression(
        '=',
        j.memberExpression(
          j.identifier(name),
          j.identifier(fieldName),
          false
        ),
        j.literal(name)
      )
    );

  const updateRelayRoute = path => {
    j(path).insertAfter(
      createAssignmentExpression(path.value.id.name, 'routeName')
    );
  };

  if (!ReactUtils.hasModule(root, 'Relay')) {
    return null;
  }

  const didTransform = findRelayRoutes(root)
    .forEach(updateRelayRoute)
    .size() > 0

  return didTransform ? root.toSource(printOptions) + '\n' : null;
}

module.exports = relayRouteName;
