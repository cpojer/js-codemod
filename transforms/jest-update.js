module.exports = function(file, api, options = {}) {
  if (
    !file.path.includes('/__tests__/') &&
    !file.path.includes('/__mocks__/')
  ) {
    return;
  }

  if (
    !file.source.includes('mock-modules') &&
    !file.source.includes('mocks')
  ) {
    return;
  }

  const j = api.jscodeshift;
  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);
  let mutations = 0;

  const getRequireCall = (path, moduleName) => {
    const call = path
      .findVariableDeclarators()
      .filter(j.filters.VariableDeclarator.requiresModule(moduleName));
    return call.size() == 1 ? call.get() : null;
  };

  const MOCK_MODULES_API = {
    dontMock: 'dontMock',
    mock: 'mock',
    autoMockOff: 'autoMockOff',
    autoMockOn: 'autoMockOn',
    dumpCache: 'resetModuleRegistry',
    generateMock: 'generateMock',
  };

  const MOCKS_API = {
    getMockFunction: 'genMockFn',
    getMockFn: 'genMockFn',
  };

  const moduleMatcher = moduleName => node => (
    node.name == 'mockModules' ||
    node.name == 'MockModules' ||
    node.name == 'modules' ||
    node.name == 'mocks' ||
    (
      node.type == 'CallExpression' &&
      node.callee.type == 'Identifier' &&
      node.callee.name == 'require' &&
      node.arguments.length == 1 &&
      node.arguments[0].value == moduleName
    )
  );

  const updateAPIs = (matcher, apiMethods) =>
    mutations += root
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: matcher,
          property: {
            name: name => apiMethods[name],
          },
        },
      })
      .replaceWith(
        p => j.callExpression(
          j.memberExpression(
            j.identifier('jest'),
            j.identifier(apiMethods[p.value.callee.property.name]),
            false
          ),
          p.value.arguments
        )
      )
      .size();

  const removeRequireCall = name => {
    const declarator = getRequireCall(root, name);
    if (declarator) {
      const hasMockModulesIdentifier = root
        .find(j.Identifier, {name: declarator.value.id.name})
        .size() > 1;
      if (!hasMockModulesIdentifier) {
        j(declarator).remove();
        mutations++;
      }
    }

    root.find(j.CallExpression, {callee: {name}})
      .remove();
  };

  updateAPIs(moduleMatcher('mock-modules'), MOCK_MODULES_API);
  updateAPIs(moduleMatcher('mocks'), MOCKS_API);
  removeRequireCall('mock-modules');
  removeRequireCall('mocks');

  return mutations ? root.toSource(printOptions) : null;
};
