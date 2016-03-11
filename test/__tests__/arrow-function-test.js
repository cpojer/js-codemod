'use strict';

const printOptions = {
  trailingComma: true,
};

describe('arrow-function', () => {

  it('transforms correctly', () => {
    test('arrow-function', 'arrow-function-test', {
      'inline-single-expressions': true,
      printOptions,
    });

    test('arrow-function', 'arrow-function-test2');
  });

});
