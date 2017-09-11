/**
 * Convert Jasmine-style code to Jest code.
 *
 * Background: Jasmine recommended using a `this` to provide context between
 * `beforeEach` blocks and specs, but Jest removed this functionality, as noted
 * here:
 * https://github.com/facebook/jest/pull/3957
 *
 * This script pulls out `this.` declarations from `beforeEach` blocks and
 * puts them into shared `let`s.
 *
 * There are cases it doesn't handle:
 * * tests that establish different `this` contexts for other purposes will be
 *   incorrectly patched
 * * `this` usages within specs without `beforeEach` references will break
 */
export default function transformer (file, api) {
  const j    = api.jscodeshift
  const b    = j.types.builders
  const root = j(file.source)

  // Build `let` statement based on each `beforeEach` block.
  j.types.visit(root, {
    visitFunction: function (path) {
      if (!path.parent.value.callee) return this.traverse(path)

      const fnName = path.parent.value.callee.name,
            type   = path.parent.value.type
      if (fnName === 'beforeEach' && type == 'CallExpression') {

        const thisAssignmentExpressions = root.find(j.AssignmentExpression, {
          left: {
            type  : 'MemberExpression',
            object: { type: 'ThisExpression' }
          }
        })

        let varNames = []
        thisAssignmentExpressions
          .filter(ae => {
            let pp = ae.parentPath
            while (pp && pp.value !== path.value) pp = pp.parentPath
            return !!pp
          })
          .forEach(ae => {
            varNames.push(ae.value.left.property.name)
          })
        varNames = Array.from(new Set(varNames)) // .uniq

        if (varNames.length > 0) {
          const letDecl = b.variableDeclaration('let', varNames.map(v =>
            b.variableDeclarator(j.identifier(v), null)))
          path.parent.parentPath.insertBefore(letDecl)
        }
        return false

      } else
        return this.traverse(path)
    }
  })


  // Convert all the `this.` to reference above `let` variables.
  const memberExpressions = root.find(j.Node, {
    type  : 'MemberExpression',
    object: {
      type: 'ThisExpression'
    }
  })
  memberExpressions.forEach(memberExpression => {
    memberExpression.replace(j.identifier(memberExpression.value.property.name))
  })

  return root.toSource()
}
