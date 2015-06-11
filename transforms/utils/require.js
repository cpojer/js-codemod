module.exports = function(j) {
  const getRequireCall = (path, moduleName) => {
    const call = path
      .findVariableDeclarators()
      .filter(j.filters.VariableDeclarator.requiresModule(moduleName));
    return call.size() == 1 ? call.get() : null;
  };

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
      const index = grandParent.body.indexOf(parent.value);
      if (index != -1) {
        grandParent.body = grandParent.body.filter(s => s !== parent.value);
        if (parent.value.comments) {
          // The item was removed, so the next one is at the item's index
          const next = grandParent.body[index];
          next.comments = parent.value.comments.concat(next.comments || []);
        }
      }
    }
  };

  return {
    getRequireCall,
    removeRequire
  };
};
