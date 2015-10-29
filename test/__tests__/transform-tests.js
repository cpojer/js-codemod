/*
 *  Copyright (c) 2015-present, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

"use strict";

jest.autoMockOff();

const fs = require('fs');
const jscodeshift = require('jscodeshift');

function read(fileName) {
  return fs.readFileSync(__dirname + '/../' + fileName, 'utf8');
}

function test(transformName, testFileName, options, fakeOptions) {
  let path = testFileName + '.js';
  const source = read(testFileName + '.js');
  const output = read(testFileName + '.output.js');
  const transform = require('../../transforms/' + transformName);

  if (fakeOptions) {
    if (fakeOptions.path) {
      path = fakeOptions.path;
    }
  }

  expect(
    (transform({path, source}, {jscodeshift}, options || {}) || '').trim()
  ).toEqual(
    output.trim()
  );
}

describe('Transform Tests', () => {

  it('transforms the "use strict" tests correctly', () => {
    test('use-strict', 'use-strict-test', {
      printOptions: {
        quote: 'single'
      }
    });
  });

  it('transforms the "arrow function" tests correctly', () => {
    test('arrow-function', 'arrow-function-test', {
      'inline-single-expressions': true
    });

    test('arrow-function', 'arrow-function-test2');
  });

  it('transforms the "rm merge" tests correctly', () => {
    test('rm-merge', 'rm-merge-test');
  });

  it('transforms the "rm copyProperties" tests correctly', () => {
    test('rm-copyProperties', 'rm-copyProperties-test');

    test('rm-copyProperties', 'rm-copyProperties-test2');
  });

  it('transforms the "arrow function arguments" tests correctly', () => {
    test('arrow-function-arguments', 'arrow-function-arguments-test');
  });

  it('transforms the "touchable" tests correctly', () => {
    test('touchable', 'touchable-test');
  });

  it('transforms the "no-vars" tests correctly', () => {
    test('no-vars', 'no-vars-test');
  });

  it('transforms the "jest-update" tests correctly', () => {
    test('jest-update', 'jest-update-test', null, {
      path: '/__tests__/jest-test.js',
    });
  });

});
