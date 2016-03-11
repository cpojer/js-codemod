'use strict';

const printOptions = {
  trailingComma: true,
};

describe('rm-copyProperties', () => {

  it('transforms correctly', () => {
    test('rm-copyProperties', 'rm-copyProperties-test', {
      printOptions,
    });

    test('rm-copyProperties', 'rm-copyProperties-test2', {
      printOptions,
    });
  });

});
