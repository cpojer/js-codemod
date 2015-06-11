// -----------------------------------------------------------------------------
// Get rid of `copyProperties`
function rmCopyProperties(file, api, options) {
  const j = api.jscodeshift;

  const {getRequireCall, removeRequire} = require('./utils/require')(j);

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const onlyObjectLiterals = path =>
    path.value.arguments.slice(1).every(
      argument => argument.type == 'ObjectExpression'
    );

  const rmCopyPropertyCalls = path =>
    j(path).replaceWith(j.callExpression(
      j.memberExpression(
        j.identifier('Object'),
        j.identifier('assign'),
        false
      ),
      path.value.arguments
    ));

  const declarator = getRequireCall(root, 'copyProperties');
  if (declarator) {
    const variableName = declarator.value.id.name;
    const didTransform = root
      .find(j.CallExpression, {callee: {name: variableName}})
      .filter(onlyObjectLiterals)
      .forEach(rmCopyPropertyCalls)
      .size() > 0;
    if (didTransform) {
      if (!root.find(j.CallExpression, {callee: {name: variableName}}).size()) {
        removeRequire(declarator);
      }
      return root.toSource(printOptions) + '\n';
    }
  }
  return null;
}

module.exports = rmCopyProperties;
