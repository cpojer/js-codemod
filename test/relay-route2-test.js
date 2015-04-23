'use strict';

var Relay = require('Relay');
var RelayRootCalls = require('RelayRootCalls');

class StoryRoute extends Relay.Route {}
StoryRoute.path = '/story/{story}';

StoryRoute.paramDefinitions = {
  story: {
    type: 'String',
    required: true
  }
};

StoryRoute.queries = {
  story: (Component, params, rql) => rql`
    node(${params.story}) {
      ${Component.getQuery('story')}
    }
  `,
  optional: (Component, params, rql) => params.story ? rql`
    node(${params.story}) {
      ${Component.getQuery('optional')}
    }
  ` : null,
  viewer: RelayRootCalls.viewer
};

class StoryRoute2 extends Relay.Route {}

StoryRoute2.queries = {
  viewer: (Component, params, rql) => rql`
    node(${params.story}) {
      ${Component.getQuery('viewer')}
    }
  `,
};

module.exports = StoryRoute;
