module.exports = (file, api, options) => {
  const j = api.jscodeshift;
  const flatten = array => [].concat(...array);
  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  const rmObjectAssignCall = path =>
    j(path).replaceWith(
      j.objectExpression(
        flatten(
          path.value.arguments.map(
            a => a.type === 'ObjectExpression' ? a.properties : j.spreadProperty(a)
          )
        )
      )
    );

  root
    .find(j.CallExpression, {
      callee: { object: { name: 'Object' }, property: { name: 'assign' } },
      arguments: [{ type: 'ObjectExpression' }]
    })
    .filter(p => !p.value.arguments.some(a => a.type === 'SpreadElement'))
    .forEach(rmObjectAssignCall);

  return root.toSource(printOptions);
};
