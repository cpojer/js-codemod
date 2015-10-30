/*
 *  Copyright (c) 2015-present, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

const printOptions = {
  trailingComma: true,
};

describe('Transform Tests', () => {

  it('transforms the "use strict" tests correctly', () => {
    test('use-strict', 'use-strict-test', {
      printOptions: {
        quote: 'single',
      },
    });
  });

  it('transforms the "arrow function" tests correctly', () => {
    test('arrow-function', 'arrow-function-test', {
      'inline-single-expressions': true,
      printOptions,
    });

    test('arrow-function', 'arrow-function-test2');
  });

  it('transforms the "rm merge" tests correctly', () => {
    test('rm-merge', 'rm-merge-test', {
      printOptions,
    });
  });

  it('transforms the "rm copyProperties" tests correctly', () => {
    test('rm-copyProperties', 'rm-copyProperties-test', {
      printOptions,
    });

    test('rm-copyProperties', 'rm-copyProperties-test2', {
      printOptions,
    });
  });

  it('transforms the "arrow function arguments" tests correctly', () => {
    test('arrow-function-arguments', 'arrow-function-arguments-test');
  });

  it('transforms the "touchable" tests correctly', () => {
    test('touchable', 'touchable-test');
  });

  it('transforms the "no-vars" tests correctly', () => {
    test('no-vars', 'no-vars-test', {
      printOptions,
    });
  });

  it('transforms the "jest-update" tests correctly', () => {
    test('jest-update', 'jest-update-test', null, {
      path: '/__tests__/jest-test.js',
    });
  });

});
