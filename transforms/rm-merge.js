// -----------------------------------------------------------------------------
// Get rid of `merge`
function rmMerge(file, api, options) {
  const j = api.jscodeshift;

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const flatten = a => Array.isArray(a) ? [].concat(...a.map(flatten)) : a;

  const rmMergeCalls = path =>
    j(path).replaceWith(j.objectExpression(
      flatten(path.value.arguments.map(p =>
        p.type == 'ObjectExpression' ? p.properties : j.spreadProperty(p)
      ))
    ));

  const removeRequire = path => {
    const {parent} = path;
    const {declarations} = parent.value;
    if (declarations.length > 1) {
      j(parent).replaceWith(j.variableDeclaration(
        'var',
        declarations.filter(d => d !== path.value)
      ));
    } else {
      const grandParent = parent.parent.value;
      grandParent.body = grandParent.body.filter(s => s !== parent.value);
    }
  };

  const getRequireCall = path => {
    const call = root
      .findVariableDeclarators()
      .filter(j.filters.VariableDeclarator.requiresModule('merge'));
    return call.size() == 1 ? call.get() : null;
  };

  const declarator = getRequireCall(root);
  if (declarator) {
    const didTransform = root
      .find(j.CallExpression, {callee: {name: declarator.value.id.name}})
      .forEach(rmMergeCalls)
      .size() > 0;
    if (didTransform) {
      removeRequire(declarator);
      return root.toSource(printOptions) + '\n';
    }
  }
  return null;
}

module.exports = rmMerge;
