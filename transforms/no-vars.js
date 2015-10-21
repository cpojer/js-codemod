/** 
 * Transform all your `var`s to `let` and `const`.
 *
 * Does not yet manage things that abuse variable hoisting rules. E.g. current
 * transform will cause this behavioral change:
 *
 * console.log(a); // undefined
 * if (true) {
 *   var a = 0;
 * }
 *
 * console.log(a); // TypeError
 * if (true) {
 *   let a = 0;
 * }
 */


module.exports = function(file, api) {
  const j = api.jscodeshift;
  const {expression} = j.template;

  /**
   * isMutated utility function to determine whether a VariableDeclaration
   * contains mutations. Takes an optional VariableDeclarator node argument to
   * return only whether that specific Identifier is mutated
   *
   * @param {ASTPath} node VariableDeclaration path
   * @param {ASTNode} [declarator] VariableDeclarator node
   * @return {Boolean}
   */
  const isMutated = (node, declarator) => {
    const scopeNode = node.parent;

    const hasAssignmentMutation = j(scopeNode)
      .find(j.AssignmentExpression)
      .filter(n => {
        if (declarator) {
          if (
            declarator.id.type === 'ObjectPattern' ||
            declarator.id.type === 'ArrayPattern'
          ) {
            return declarator.id.properties.some(d => d.value.name === n.value.left.name);
          }
          return declarator.id.name === n.value.left.name;
        }
        if (node.value.declarations.some(d => d.id.name === n.value.left.name)) {
          return true;
        }
      }).size() > 0;

    const hasUpdateMutation = j(scopeNode)
      .find(j.UpdateExpression)
      .filter(n => {
        if (declarator) {
          if (
            declarator.id.type === 'ObjectPattern' ||
            declarator.id.type === 'ArrayPattern'
          ) {
            return declarator.id.properties.some(d => d.value.name === n.value.argument.name);
          }
          return declarator.id.name === n.value.argument.name;
        }

        if (node.value.declarations.some(d => d.id.name === n.value.argument.name)) {
          return true;
        }
      }).size() > 0;

    return hasAssignmentMutation || hasUpdateMutation
  }

  const isAccessedInClosure = (node) => {

    return j(node.value.body)
      .find(j.Identifier)
      .filter(n => {
        const declarations = node.value.init ? node.value.init.declarations
                           : node.value.left ? node.value.left.declarations
                           : [];
        if (declarations.some(d => d.id.name === n.value.name)) {
          let parent = n.parent;
          while (parent.value !== node.value.body) {
            parent = parent.parent;
            if (/Function/.test(parent.value.type)) {
              return true;
            }
          }
          return false;
        }
      }).size() > 0;
  }

  let root = j(file.source)

  // convert all necessary variable declarations to let or const
  let changedVariableDeclaration = root
    .find(j.VariableDeclaration)
    .filter(
      p => {
        if (
          'ForStatement' === p.parent.value.type ||
          'ForInStatement' === p.parent.value.type ||
          'ForOfStatement' === p.parent.value.type
        ) {
          if (!isAccessedInClosure(p.parent)) {
            p.value.kind = 'let';
          }
          return true;
        } else {
          const lets = [], consts = [];
          p.value.declarations.forEach(decl => {
            if (!decl.init || isMutated(p, decl)) {
              lets.push(decl)
            } else {
              consts.push(decl);
            }
          });

          let replaceWith = []
          if (lets.length) replaceWith.push(j.variableDeclaration('let', lets));
          if (consts.length) replaceWith.push(j.variableDeclaration('const', consts));

          if (replaceWith.length) {
            if (p.value.comments || p.value.leadingComments) {
              replaceWith[0].leadingComments = p.value.leadingComments;
              replaceWith[0].comments = p.value.comments;
            }
            j(p).replaceWith(replaceWith);
            return true;
          }
          else {
            return false;
          }
        }
      }
    ).size() > 0;

  // if a iterator statement attempts to reuse a loose iterator variable
  // change it to a let declaration
  let changedStatement = root
    .find(j.Statement)
    .filter(exp => (
      'ForStatement' === exp.value.type ||
      'ForInStatement' === exp.value.type ||
      'ForOfStatement' === exp.value.type
    ))
    .filter(stmt => (
      stmt.value.init && stmt.value.init.type === 'AssignmentExpression'
    ))
    .forEach(p => {
      p.value.init = j.variableDeclaration(
        p.value.type === 'ForStatement' || isMutated(p.value) ? 'let' : 'const',
        [j.variableDeclarator(p.value.init.left, p.value.init.right)]
      );
    }).size() > 0;

  if (changedVariableDeclaration || changedStatement) {
    return root.toSource();
  }
};
