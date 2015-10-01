/** 
 * Transform all your `var`s to `let` and `const`.
 *
 * The only catch is it may not catch nested bodies that mutate anything beyond
 * a single parent.
 */


module.exports = function(file, api) {
  const j = api.jscodeshift;

  // a quick and likely incomplete check if a variable has been mutated within
  // a variables direct parent scope
  var isMutated = (node) => {
    var mutated = false;
    j(node.parent)
      .find(j.AssignmentExpression)
      .forEach(n => {
        if (node.value.declarations.some(d => d.id.name === n.value.left.name)) {
          mutated = true;
        }
      });

    j(node.parent)
      .find(j.UpdateExpression)
      .forEach(n => {
        if (node.value.declarations.some(d => d.id.name === n.value.argument.name)) {
          mutated = true;
        }
      });
    return mutated;
  }

  var ast = j(file.source)

  // convert all necessary variable declarations to let or const
  ast
    .find(j.VariableDeclaration)
    .forEach(
      p => {
        if (p.value.kind !== 'var') return;
        if (
          'ForStatement' === p.parent.value.type ||
          'ForInStatement' === p.parent.value.type ||
          'ForOfStatement' === p.parent.value.type ||
          'WhileStatement' === p.parent.value.type ||
          isMutated(p)
        ) {
          p.value.kind = 'let';
        } else {
          p.value.kind = 'const';
        }
      }
    );

  // if a iterator statement attempts to reuse a loose iterator variable 
  // change it to a let declaration
  ast
    .find(j.Statement)
    .filter(exp => (
      exp.value.type === 'ForStatement' ||
      exp.value.type === 'ForInStatement' ||
      exp.value.type === 'ForOfStatement'
    ))
    .forEach(
      p => {
        if (p.value.init.type === 'AssignmentExpression') {
          p.value.init = j.variableDeclaration('let', [
            j.variableDeclarator(
              p.value.init.left,
              p.value.init.right
            )
          ]);
        }
      }
    );

  return ast.toSource();
};
