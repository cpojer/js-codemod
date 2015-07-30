'use strict';

var React = require('React');
var Relay = require('Relay');

var abc = 10;

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

module.exports = Relay.createContainer(Thing, {});
