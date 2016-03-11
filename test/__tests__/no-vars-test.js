'use strict';

const printOptions = {
  trailingComma: true,
};

describe('no-vars', () => {

  it('transforms correctly', () => {
    test('no-vars', 'no-vars-test', {
      printOptions,
    });
  });

});
