module.exports = function(file, api) {
  const jscodeshift = api.jscodeshift;
  const requireStatements = new Set();

  const root = jscodeshift(file.source)
    .find(jscodeshift.CallExpression, {callee: {name: 'require'}})
    .filter(requireStatement => (
      requireStatement.parent.value.type == 'VariableDeclarator' &&
      requireStatement.parent.parent.value.declarations.length != 1
    ))
    .forEach(requireStatement => {
      requireStatements.add(requireStatement.parent.parent);
    });

  requireStatements.forEach(requireStatement => {
    jscodeshift(requireStatement)
      .replaceWith(requireStatement.value.declarations.map((declaration, i) => {
        var variableDeclaration =
          jscodeshift.variableDeclaration('var', [declaration]);

        if (i == 0) {
          variableDeclaration.comments = requireStatement.value.comments;
        }

        return variableDeclaration;
      }
    ));
  });

  return requireStatements.size ? root.toSource({quote: 'single'}) : null;
};
