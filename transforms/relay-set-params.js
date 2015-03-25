function renameQueryParamsFn(file, api, options) {
  const j = api.jscodeshift;

  require('./utils/array-polyfills');
  const ReactUtils = require('./utils/ReactUtils')(j);

  const printOptions = options.printOptions || {quote: 'single'};
  const root = j(file.source);

  const SET_PARAMS = 'setParams';

  const SET_QUERY_PARAMS_CALL = {
    object: {
      object: {
        type: 'ThisExpression',
      },
      property: {
        type: 'Identifier',
        name: 'props',
      },
    },
    property: {
      type: 'Identifier',
      name: 'setQueryParams',
    },
  };

  const createSetParamsCall = () =>
    j.memberExpression(
      j.memberExpression(
        j.thisExpression(),
        j.identifier('props'),
        false
      ),
      j.identifier(SET_PARAMS),
      false
    );

  const warnIfCallback = (path, name) => {
    const callPath = j(path).closest(j.CallExpression).get();
    const callExpression = callPath && callPath.value;
    if (callExpression && callExpression.arguments.length > 1) {
      console.log(
        file.path + ': "' + name + '" has setQueryParams call with callback.'
      );
    }
  };

  const update = classPath =>
    j(classPath)
      .find(j.MemberExpression, SET_QUERY_PARAMS_CALL)
      .forEach(path => {
        warnIfCallback(path, ReactUtils.getComponentName(classPath));
        j(path).replaceWith(createSetParamsCall());
      })
      .size() > 0;

  if (
    ReactUtils.hasModule(root, 'React') &&
    ReactUtils.hasModule(root, 'Relay')
  ) {
    const didTransform =
      (
        ReactUtils.findReactCreateClass(root).filter(update).size() +
        ReactUtils.findReactES6ClassDeclaration(root).filter(update).size()
      ) > 0;

    if (didTransform) {
      return root.toSource(printOptions) + '\n';
    }
  }

  return null;
}

module.exports = renameQueryParamsFn;
