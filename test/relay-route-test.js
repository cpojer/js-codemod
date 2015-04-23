'use strict';

var DliteRoute = require('DliteRoute');
var RelayRootCalls = require('RelayRootCalls');

var StoryRoute = DliteRoute.create({
  name: 'StoryRoute',
  path: '/story/{story}',
  paramDefinitions: {
    story: {
      type: 'String',
      required: true
    }
  },
  queries: {
    story: (value, childQuery, query) => query`
      node(${value}) {
        ${childQuery}
      }
    `,
    optional: (value, childQuery, query) => value ? query`
      node(${value}) {
        ${childQuery}
      }
    ` : null,
    viewer: RelayRootCalls.viewer
  }
});

var StoryRoute2 = DliteRoute.create({
  name: 'StoryRoute2',
  queries: {
    viewer: function(value, childQuery, query) {
      return query`
        node(${value}) {
          ${childQuery}
        }
      `
    },
  }
});

module.exports = StoryRoute;
