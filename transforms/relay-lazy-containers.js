function createLazyInnerComponent(file, api, options) {
  const j = api.jscodeshift;

  require('./utils/array-polyfills');
  const ReactUtils = require('./utils/ReactUtils')(j);

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const RelayCreateContainerMemberExpression = {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'Relay',
    },
    property: {
      type: 'Identifier',
      name: 'createContainer',
    },
  };

  // ---------------------------------------------------------------------------
  // Finds Relay components
  const findRelayCreateContainerCalls = root =>
    root
      .find(j.CallExpression, {
        callee: RelayCreateContainerMemberExpression
      });

  const findRelayComponentNames = root => {
    const names = [];
    findRelayCreateContainerCalls(root)
      .forEach(path => names.push(path.value.arguments[0].name));
    return names;
  };

  const createInitFunctionCall = (statements, componentName) =>
    j.functionDeclaration(
      j.identifier('__init'),
      [],
      j.blockStatement(
        statements.concat([
          j.returnStatement(
            j.identifier(componentName)
          )
        ])
      )
    );

  const createRelayCreateContainerExpression = () =>
    j.memberExpression(
      j.identifier('Relay'),
      j.identifier('createContainer'),
      false
    );

  const updateCreateContainerCall = createContainerPath => {
    const args = createContainerPath.value.arguments.slice(0);
    args[0] = j.identifier('__init');
    j(createContainerPath)
      .replaceWith(
        j.callExpression(
          createRelayCreateContainerExpression(),
          args
        )
      );
  };

  const isUseStrict = node => (
    node.type == 'ExpressionStatement' &&
    node.expression.type == 'Literal' &&
    node.expression.value == 'use strict'
  );

  const isRequireBlock = node => (
    node.type == 'VariableDeclaration' &&
    node.declarations.some(declaration => (
      declaration.type == 'VariableDeclarator' &&
      declaration.init.type == 'CallExpression' &&
      declaration.init.callee.type == 'Identifier' &&
      declaration.init.callee.name == 'require'
    ))
  );

  // Any variable declarator that is not React.createClass
  const isVariableDeclaration = node => (
    node.type == 'VariableDeclaration' &&
    !node.declarations.some(declaration => (
      declaration.type == 'VariableDeclarator' &&
      declaration.init.type == 'CallExpression' &&
      declaration.init.callee.type == 'MemberExpression' &&
      declaration.init.callee.object.type == 'Identifier' &&
      declaration.init.callee.object.name == 'React' &&
      declaration.init.callee.property.type == 'Identifier' &&
      declaration.init.callee.property.name == 'createClass'
    ))
  );

  const isRelayContainerExpression = node => (
    node.type == 'ExpressionStatement' &&
    node.expression.type == 'AssignmentExpression' &&
    node.expression.right.type == 'CallExpression' &&
    node.expression.right.callee.object.type == 'Identifier' &&
    node.expression.right.callee.object.name == 'Relay' &&
    node.expression.right.callee.property.type == 'Identifier' &&
    node.expression.right.callee.property.name == 'createContainer'
  );

  const isModuleExports = node => (
    node.type == 'ExpressionStatement' &&
    node.expression.type == 'AssignmentExpression' &&
    node.expression.left.type == 'MemberExpression' &&
    node.expression.left.object.type == 'Identifier' &&
    node.expression.left.object.name == 'module' &&
    node.expression.left.property.type == 'Identifier' &&
    node.expression.left.property.name == 'exports'
  );

  const hasContainerName = (node, containerName) =>
    containerName ?
      (
        node.type == 'ExpressionStatement' &&
        node.expression.type == 'AssignmentExpression' &&
        node.expression.left.type == 'MemberExpression' &&
        node.expression.left.object.type == 'Identifier' &&
        node.expression.left.object.name == containerName
      ) :
      false;

  const partitionBodyStatements = (root, containerName) => {
    const bodyStatements = [];
    const fnStatements = [];
    root.get().value.body.forEach(node => {
      if (
        isUseStrict(node) ||
        isRequireBlock(node) ||
        isVariableDeclaration(node) ||
        isRelayContainerExpression(node) ||
        isModuleExports(node) ||
        hasContainerName(node, containerName)
      ) {
        bodyStatements.push(node);
      } else {
        fnStatements.push(node);
      }
    });

    return {
      bodyStatements: bodyStatements,
      fnStatements: fnStatements,
    }
  };

  const updateBody = (root, statements) => {
    const node = root.get().value;
    statements.comments = node.body.comments;
    node.body = statements;
  };

  const getContainerName = createContainerPath => {
    var path = j(createContainerPath).closest(j.VariableDeclarator);
    if (path.size()) {
      return path.get().value.id.name;
    }
    return null;
  };

  if (!ReactUtils.hasModule(root, 'Relay')) {
    return null;
  }

  var names = findRelayComponentNames(root);
  if (!names.length) {
    return null;
  }

  if (names.length > 1) {
    console.log(
      file.path + ': File has more than one Relay.createContainer call'
    );
    return null;
  }

  var createContainerPath = findRelayCreateContainerCalls(root).get();
  var containerName = getContainerName(createContainerPath);
  var statements = partitionBodyStatements(root, containerName);

  statements.bodyStatements.push(
    createInitFunctionCall(statements.fnStatements, names[0])
  );

  updateCreateContainerCall(createContainerPath);
  updateBody(root, statements.bodyStatements);

  return root.toSource(printOptions) + '\n';
}

module.exports = createLazyInnerComponent;
