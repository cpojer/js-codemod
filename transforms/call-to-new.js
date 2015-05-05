function callToNew(file, api, options) {
  const j = api.jscodeshift;

  require('./utils/array-polyfills');
  const ReactUtils = require('./utils/ReactUtils')(j);

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const name = options.name;

  const createArgument = () =>
    j.memberExpression(
      j.memberExpression(
        j.identifier('window'),
        j.identifier('location'),
        false
      ),
      j.identifier('href'),
      false
    );

  const findCalls = root =>
    root.find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name
      },
    });

  const createNewExpression = (name, args) =>
    j.newExpression(
      j.identifier(name),
      args
    );

  const updateCalls = path => {
    var args = path.value.arguments;
    j(path).replaceWith(
      createNewExpression(name, args.length ? args : [createArgument()])
    );
  };

  if (!ReactUtils.hasModule(root, name)) {
    return null;
  }

  const didTransform = findCalls(root)
    .forEach(updateCalls)
    .size() > 0

  return didTransform ? root.toSource(printOptions) + '\n' : null;
}

module.exports = callToNew;
