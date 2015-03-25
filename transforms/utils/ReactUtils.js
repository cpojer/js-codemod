module.exports = function(j) {
  // ---------------------------------------------------------------------------
  // Checks if the file requires a certain module
  const hasModule = (path, module) =>
    path
      .findVariableDeclarators()
      .filter(j.filters.VariableDeclarator.requiresModule(module))
      .size() == 1;

  const hasReact = path => (
    hasModule(path, 'React') ||
    hasModule(path, 'react') ||
    hasModule(path, 'react/addons')
  );

  // ---------------------------------------------------------------------------
  // Finds all variable declarations that call React.createClass
  const findReactCreateClassCallExpression = path =>
    j(path).find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          name: 'React',
        },
        property: {
          name: 'createClass',
        },
      }
    });

  const findReactCreateClass = path =>
    path
      .findVariableDeclarators()
      .filter(path => findReactCreateClassCallExpression(path).size() > 0);

  // ---------------------------------------------------------------------------
  // Finds all classes that extend React.Component
  const findReactES6ClassDeclaration = root =>
    root.find(j.ClassDeclaration, {
      superClass: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'React',
        },
        property: {
          type: 'Identifier',
          name: 'Component',
        },
      },
    });

  // ---------------------------------------------------------------------------
  // Checks if the React class has mixins
  const isMixin = ({key, value}) => (
    key.name == 'mixins' &&
    value.type == 'ArrayExpression' &&
    Array.isArray(value.elements) &&
    value.elements.length
  );

  const hasMixins = classPath => {
    const spec = getReactCreateClassSpec(classPath);
    return spec && spec.properties.some(isMixin);
  };

  // ---------------------------------------------------------------------------
  // Others
  const getReactCreateClassSpec = classPath => {
    const spec = classPath.value.init.arguments[0];
    if (spec.type == 'ObjectExpression' && Array.isArray(spec.properties)) {
      return spec;
    }
  };

  const getComponentName = classPath => classPath.node.id.name;

  return {
    findReactES6ClassDeclaration,
    findReactCreateClass,
    findReactCreateClassCallExpression,
    getComponentName,
    getReactCreateClassSpec,
    hasMixins,
    hasModule,
    hasReact,
  };
};
