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
