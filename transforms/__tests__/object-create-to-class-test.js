"use strict";

jest.autoMockOff();
const defineTest = require("jscodeshift/dist/testUtils").defineTest;

defineTest(__dirname, "object-create-to-class");
