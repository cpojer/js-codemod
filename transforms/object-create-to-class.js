/**
 * This codemod converts Object.create() usages to es6 class declarations.
 * It's written for use with Facebook's jscodeshift:
 * https://github.com/facebook/jscodeshift
 */
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;

  const root = j(fileInfo.source);

  // Find all Object.create occurrences and convert them.
  return root
    .find(j.AssignmentExpression)
    .filter(isObjectCreateNode)
    .forEach(node => {
      const ctorFn = getConstructorFunctionNode(node.value, j, root);
      const prototypeAssignment = node.value.right;

      // Replace the current Object.create node with a new class declaration built out
      // of the function ctor and prototype chain link.
      node.replace(createClassDeclaration(j, ctorFn.value, prototypeAssignment));

      // Delete ctor fn after its contents have been extracted.
      ctorFn.replace();
    })
    .toSource();
};

/**
 * Creates a ClassDeclaration AST object from a constructor function 
 * and the Object.create RHS.
 */
function createClassDeclaration(j, ctorFn, prototypeAssignment) {
  const classBody = createClassBody(j, prototypeAssignment, ctorFn);
  const superClass = getSuperClass(prototypeAssignment, j);
  const classDec = j.classDeclaration(ctorFn.id, classBody, superClass);
  return classDec;
}

/**
 * Creates the ClassDeclaration's body from the Object.create RHS.
 */
function createClassBody(j, prototypeAssignment, ctorFn) {
  // TODO transform super call
  const superClass = getSuperClass(prototypeAssignment);
  const newCtor = j.methodDefinition(
    "constructor",
    j.identifier("constructor"),
    createCtorFunction(j, ctorFn, superClass),
    false
  );
  newCtor.comments = ctorFn.comments;
  let contents = [newCtor];

  // 2 overloads for Object.create, the 1st param may optionally be a 
  // prototype chain link as a 'super' class. If that's the case extend it.
  const propDescriptorsIdx = superClass === null ? 0 : 1;
  contents = contents.concat(getClassProperties(j, prototypeAssignment.arguments[propDescriptorsIdx]));

  return j.classBody(contents);
}

/**
 * Extract a class constructor from the constructor function.
 */
function createCtorFunction(j, ctorFn, superClass) {
  let body = ctorFn.body;
  const ctorName = ctorFn.id.name;
  let ctorBody = ctorFn.body.body;
  // Potentially need to use a converted SuperClass.call -> super()
  if (ctorBody.length && ctorBody[0].type === "ExpressionStatement" &&
    ctorBody[0].expression.callee.object.name === superClass.name &&
    ctorBody[0].expression.callee.property.name === "call") {
    // replace the first expression here with a super call.
    ctorBody[0].expression.callee = j.super();
    ctorBody[0].expression.arguments.splice(0, 1); // remove `this`.
  }
  return j.functionExpression(ctorFn.id, ctorFn.params, body, false);
}

/**
 * For a class body's contents, you can have a get/set/method. This converts from a 
 * PropertyDescriptor key to that. 
 */
function getClassProperties(j, properties) {
  const mapType = key => {
    switch (key) {
      case "value":
        return "method";
      default:
        return key;
    }
  };

  // There could be multiple get/set props here so we cannot do a 1-1 map.
  const props = [];
  (properties.properties || []).forEach(property => {
    property.value.properties
      .filter(prop => validDescriptorKey(prop.key.name))
      .forEach(prop => {
        const newProp = j.methodDefinition(
          mapType(prop.key.name),
          j.identifier(property.key.name),
          j.functionExpression(j.identifier(property.key.name), prop.value.params, prop.value.body, false),
          false
        );

        if (property.comments) {
          newProp.comments = property.comments;
        }

        props.push(newProp);
      });
  });
  return props;
}

/**
 * Gets the 'super' class from the Object.create params.
 */
function getSuperClass(prototypeAssignment, j) {
  return (prototypeAssignment.arguments.length > 1 && prototypeAssignment.arguments[0].object) || null;
}

/**
 * Searches through the given root AST for a constructor function for the given 
 * Object.create statement.
 */
function getConstructorFunctionNode(assignmentOperator, j, root) {

  const constructorName = assignmentOperator.left.object.name;
  const candidateFns = root.find(j.FunctionDeclaration).filter(funcDec => {
    return funcDec.value.id.name === constructorName;
  });
  if (!candidateFns.length || candidateFns.length > 1) {
    throw new Error("0 or >1 candidate functions found: ", candidateFns);
  }
  return candidateFns.get();
}

/**
 * To be one of these, it must be assigning to a prototype on the LHS, and 
 * using Object.create() on the RHS
 */
function isObjectCreateNode(assignmentExpression) {
  const isLhsAssigningToAPrototype = assignmentExpression.value.left.property.name === "prototype";
  const rhs = assignmentExpression.value.right;
  const isRhsObjectCreate =
    rhs.type === "CallExpression" &&
    rhs.callee.type === "MemberExpression" &&
    rhs.callee.object.type === "Identifier" &&
    rhs.callee.object.name === "Object" &&
    rhs.callee.property.name === "create";

  return isLhsAssigningToAPrototype && isRhsObjectCreate;
}

/**
 * We only care about get/set/value props. You can't declare others in a class.
 * Other keys would be enumerable, writable, configurable.
 */
function validDescriptorKey(key) {
  return ~["get", "set", "value"].indexOf(key);
};
