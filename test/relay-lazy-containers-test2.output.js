'use strict';

var React = require('React');
var Relay = require('Relay');

var abc = 10;

var A = Relay.createContainer(__init, {});

A.myStatic = 10;

module.exports = A;

function __init() {
  var MyThing = React.createClass({});

  class Thing extends React.Component {

    render() {
      return <div />;
    }

  }

  Thing.propTypes = {
    viewer: React.PropTypes.object,
  };

  Thing.filed = 'foo';

  return MyThing;
}
