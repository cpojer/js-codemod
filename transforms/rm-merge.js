module.exports = (file, api, options) => {
  const j = api.jscodeshift;

  const {getRequireCall, removeRequire} = require('./utils/require')(j);

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const flatten = a => Array.isArray(a) ? [].concat(...a.map(flatten)) : a;

  const rmMergeCalls = path =>
    j(path).replaceWith(j.objectExpression(
      flatten(path.value.arguments.map(p =>
        p.type == 'ObjectExpression' ? p.properties : j.spreadProperty(p)
      ))
    ));

  const declarator = getRequireCall(root, 'merge');
  if (declarator) {
    const didTransform = root
      .find(j.CallExpression, {callee: {name: declarator.value.id.name}})
      .forEach(rmMergeCalls)
      .size() > 0;
    if (didTransform) {
      removeRequire(declarator);
      return root.toSource(printOptions);
    }
  }
  return null;
}
