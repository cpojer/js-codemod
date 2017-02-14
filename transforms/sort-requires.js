module.exports = (file, api) => {
  const j = api.jscodeshift;
  const sort = (a, b) => a.declarations[0].id.name.localeCompare(
    b.declarations[0].id.name
  );
  const root = j(file.source);
  const requires = root
    .find(j.CallExpression, {
      callee: {
        name: 'require'
      }
    })
    .closest(j.VariableDeclaration);

  let organizedRequires = [];

  // check for strict mode expression
  const strict = root.find(j.ExpressionStatement, {
    expression: {
      value: 'use strict'
    }
  });
  const strictNode = strict.nodes();
  organizedRequires = organizedRequires.concat(strictNode);
  strict.remove();

  // check for dependencies between requires
  const dependencies = requires.filter(req => {
    return req.node.declarations[0].init.arguments[0].type == 'Identifier';
  });
  const sortedDependencies = dependencies.nodes().sort(sort);
  dependencies.remove();

  // get normal, non dependent, requires
  const nonDependentRequires = requires.filter(req => {
    const declarations = req.node.declarations;
    return declarations && declarations[0].init.arguments[0].type == 'Literal';
  });
  const sortedRequires = nonDependentRequires.nodes().sort(sort);
  organizedRequires = organizedRequires.concat(sortedRequires);
  nonDependentRequires.remove();

  // add back requires with dependencies, after nonDependentRequires
  organizedRequires = organizedRequires.concat(sortedDependencies);

  return root.find(j.Statement)
    .at(0)
    .insertBefore(organizedRequires)
    .toSource();
};
