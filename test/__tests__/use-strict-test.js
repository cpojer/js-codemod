'use strict';

const printOptions = {
  quote: 'single',
};

describe('use-strict', () => {

  it('transforms correctly', () => {
    test('use-strict', 'use-strict-test', {
      printOptions,
    });
  });

});
