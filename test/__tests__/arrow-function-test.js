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

describe('arrow-function', () => {

  it('transforms correctly', () => {
    test('arrow-function', 'arrow-function-test', {
      'inline-single-expressions': true,
      printOptions,
    });

    test('arrow-function', 'arrow-function-test2');
  });

});
