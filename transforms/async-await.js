export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const isPromiseCall = node => {
    return node.type === 'CallExpression' &&
      node.callee.property &&
      node.callee.property.name === 'then';
  };

  const funcReturnsPromise = p => {
    const body = p.node.body.body;
    const last = body[body.length - 1];
    if (last.type !== 'ReturnStatement') { return false; }
    return isPromiseCall(last.argument);
  };

  const arrowReturnsPromise = p => {
    const node = p.node;

    if (node.body.type === 'BlockStatement') {
      const body = node.body.body;
      const last = body[body.length - 1];
      if (last.type !== 'ReturnStatement') { return false; }
      return isPromiseCall(last.argument);
    }

    return isPromiseCall(node.body);
  };

  const genAwaitionDeclarator = (params, exp) => {
    let declaratorId;
    if (params.length > 1) {
      declaratorId = j.arrayPattern(params.map(param => j.identifier(param.name)));
    } else {
      declaratorId = j.identifier(params[0].name);
    }

    return j.variableDeclaration('const', [
      j.variableDeclarator(declaratorId, j.awaitExpression(exp)),
    ]);
  };

  const transformFunction = p => {
    const node = p.node;
    // Set function to async
    node.async = true;

    // Transform return
    const bodyStatements = node.body.body;
    const returnExp = bodyStatements[bodyStatements.length - 1];

    const callExp = returnExp.argument;
    const callBack = callExp.arguments[0];

    // Create await statement
    let awaition;
    if (callBack.params.length > 0) {
      awaition = genAwaitionDeclarator(callBack.params, callExp.callee.object);
    } else {
      awaition = j.expressionStatement(j.awaitExpression(callExp.callee.object));
    }

    let rest;
    if (callBack.body.type === 'BlockStatement') {
      rest = callBack.body.body;
    } else {
      rest = [j.returnStatement(callBack.body)];
    }

    // Replace the function's body with the new content
    p.node.body = j.blockStatement([
      ...bodyStatements.slice(0, bodyStatements.length - 1),
      awaition,
      ...rest,
    ]);

    return p.node;
  };

  const replaceType = (type, filterer = funcReturnsPromise) => {
    // Loop until all promises are gone
    while (true) {
      const paths = root.find(type).filter(filterer);
      if (paths.size() === 0) { break; }

      paths.forEach(transformFunction);
    }
  };

  replaceType(j.FunctionDeclaration);
  replaceType(j.FunctionExpression);
  replaceType(j.ArrowFunctionExpression, arrowReturnsPromise);
  return root.toSource();
}
