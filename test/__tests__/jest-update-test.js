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

describe('jest-update', () => {

  it('transforms correctly', () => {
    test('jest-update', 'jest-update-test', null, {
      path: '/__tests__/jest-test.js',
    });
  });

});
