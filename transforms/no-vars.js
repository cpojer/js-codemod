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

  // a quick and likely incomplete check if a variable has been mutated within
  // a variables direct parent scope
  var isMutated = (node) => {
    const hasAssignmentMutation = j(node.parent)
      .find(j.AssignmentExpression)
      .filter(n => {
        if (node.value.declarations.some(d => d.id.name === n.value.left.name)) {
          return true;
        }
      }).size() > 0;

    const hasUpdateMutation = j(node.parent)
      .find(j.UpdateExpression)
      .filter(n => {
        if (node.value.declarations.some(d => d.id.name === n.value.argument.name)) {
          return true;
        }
      }).size() > 0;

    return hasAssignmentMutation || hasUpdateMutation;
  }

  let root = j(file.source)

  // convert all necessary variable declarations to let or const
  let changedVariableDeclaration = root
    .find(j.VariableDeclaration)
    .filter(
      p => {
        if (p.value.kind !== 'var') return false;

        if (
          'ForStatement' === p.parent.value.type ||
          'ForInStatement' === p.parent.value.type ||
          'ForOfStatement' === p.parent.value.type ||
          isMutated(p)
        ) {
          p.value.kind = 'let';
          return true;
        } else {
          p.value.kind = 'const';
          return true;
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
      p.value.init = j.variableDeclaration('let', [
        j.variableDeclarator(p.value.init.left, p.value.init.right)
      ]);
    }).size() > 0;

  if (changedVariableDeclaration || changedStatement) {
    return root.toSource();
  }
};
