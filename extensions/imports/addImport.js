'use strict';

const j = require('jscodeshift');

const statements = j.template.statements;
const statement = j.template.statement;

function findViaConfigType(type, nodePath) {
  return j(nodePath)
    .find(type.searchTerms[0])
    .filter(p => type.filters.every(filter => filter(p)));
}

function findInsertTypeIndex(config, requireStatement) {
  const wrappedRequireStatement = j.program([requireStatement]);
  for (let i = 0; i < config.length; i++) {
    if (findViaConfigType(config[i], wrappedRequireStatement).size()) {
      return i;
    }
  }

  throw new Error('No valid config found!');
}

function findNextInsertIndex(config, root) {
  for (let i = config.length - 1; i >= 0; i--) {
    if (findViaConfigType(config[i], root).size()) {
      return i;
    }
  }

  return -1;
}

function reprintComment(node) {
  if (node.type === 'Block') {
    return j.block(node.value);
  } else if (node.type === 'Line') {
    return j.line(node.value);
  }
  return node;
}

function applyCommentsToStatements(nodes, comments) {
  if (comments) {
    nodes[0].comments = comments.map(comment => reprintComment(comment));
  }
  return nodes;
}

function reprintNode(node) {
  if (j.ExpressionStatement.check(node)) {
    return statement`${node.expression}`;
  }

  if (j.VariableDeclaration.check(node)) {
    const declaration = node.declarations[0];
    return j.variableDeclaration(node.kind, [
      j.variableDeclarator(declaration.id, declaration.init),
    ]);
  }

  if (j.ImportDeclaration.check(node) && node.importKind === 'type') {
    // TODO: Properly remove new lines from the node.
    return node;
  }

  return node;
}

function addImport(config, root, requireStatement) {
  const insertTypeIndex = findInsertTypeIndex(config, requireStatement);
  const currentType = config[insertTypeIndex];
  const nodesForType = findViaConfigType(currentType, root).paths();

  if (nodesForType.length) {
    let insertAt = nodesForType.length;
    for (let i = 0; i < nodesForType.length; i++) {
      const pos = currentType.comparator(
        nodesForType[i].value,
        requireStatement
      );

      if (pos >= 0) {
        insertAt = i;
        break;
      }
    }

    if (insertAt === 0) {
      const nodePath = nodesForType[0];
      j(nodePath)
        .replaceWith(applyCommentsToStatements(statements`
          ${requireStatement};
          ${reprintNode(nodePath.value)};
        `, nodePath.value.comments));
    } else {
      const nodePath = nodesForType[insertAt - 1];
      j(nodePath)
        .replaceWith(applyCommentsToStatements(statements`
          ${reprintNode(nodePath.value)};
          ${requireStatement};
        `, nodePath.value.comments));
    }
  } else {
    const nextFoundConfigTypeIndex = findNextInsertIndex(
      config,
      root
    );

    if (nextFoundConfigTypeIndex > -1) {
      const requiresForType = findViaConfigType(
        config[nextFoundConfigTypeIndex],
        root
      ).paths();

      if (insertTypeIndex < nextFoundConfigTypeIndex) {
        j(requiresForType[0])
          .insertBefore(requireStatement);
      } else {
        j(requiresForType[requiresForType.length - 1])
          .insertAfter(requireStatement);
      }
    } else {
      const firstPath = j(root)
        .find(j.Program)
        .get('body')
        .get(0);

      j(firstPath)
        .replaceWith(applyCommentsToStatements(statements`
          ${requireStatement};
          ${reprintNode(firstPath.value)};
        `, firstPath.value.comments));
    }
  }
}

module.exports = addImport;
