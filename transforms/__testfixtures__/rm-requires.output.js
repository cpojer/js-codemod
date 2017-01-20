var merge = require('merge');

// Leave React alone in files with jsx
var React = require('react');

// TODO: Handle removing these vars
var {export1, export2} = require('nonUsedModule2');

// Leave side effect modules alone
require('sideEffectModule');

var x = merge(a);
var a = merge(x);

window.nonUsedModule;

merge;

function newScope() {
  var dupMerge2 = require('merge');

  dupMerge2;
}

var div = <div />;
