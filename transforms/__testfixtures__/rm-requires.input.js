var merge = require('merge');
var dupMerge = require('merge');
var nonUsedModule = require('nonUsedModule');

// Leave React alone in files with jsx
var React = require('react');

// TODO: Handle removing these vars
var {export1, export2} = require('nonUsedModule2');

// Leave side effect modules alone
require('sideEffectModule');

var x = merge(a);
var a = dupMerge(x);

window.nonUsedModule;

dupMerge;

function newScope() {
  var dupMerge2 = require('merge');
  var nonUsedModule2 = require('nonUsedModule2');

  dupMerge2;
}

var div = <div />;
