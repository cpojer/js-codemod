module.exports = function(file, api) {
  const j = api.jscodeshift;
  const S = new Set();
  const root = j(file.source)
    .find(j.CallExpression, {callee: {name: 'require'}})
  .filter(p => (
      p.parent.value.type == 'VariableDeclarator' &&
      p.parent.parent.value.declarations.length != 1
    ))
    .forEach(p => {
      S.add(p.parent.parent);
    });
  S.forEach(p => {
    j(p).replaceWith(p.value.declarations.map(
      (declaration, i) => {
        var d = j.variableDeclaration('var', [declaration]);
        if (i == 0) {
          d.comments = p.value.comments;
        }
        return d;
      }
    ));
  });
  return S.size ? root.toSource({quote: 'single'}) : null;
};
