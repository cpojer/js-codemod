#!/usr/bin/env bash
# This scripts demonstrates how the rm-requires tranform would rename required variables
#
# Run as:
# ./test/rm-requires-renames-vars.sh
#
# Will install jscodeshift if you don't have it.
# Will clone js-codemod repo to /tmp/js-codemod if you don't run this from the repo root
set -o pipefail
set -o errexit
set -o nounset
# set -o xtrace

# Install prerequisistes if needed
type jscodeshift || npm install jscodeshift -g
[ -f transforms/rm-requires.js ] || [ -d /tmp/js-codemod ] || (cd /tmp && git clone https://github.com/cpojer/js-codemod.git && cd js-codemod)

# Save test script
echo '
const lib = `../lib`
const Car = require(`${lib}/Car`)
const db = require(`${lib}/Database`) // If you move this line above Car, it works.

class Tesla extends Car {
  fetchParts (sql, cb) {
    return db.query(sql, [], cb)
  }
}
' > /tmp/test-has-db.query.js

# Run codemod
jscodeshift /tmp/test-has-db.query.js --transform transforms/rm-requires.js

# Test for failures
cat /tmp/test-has-db.query.js |grep 'Car.query'
cat /tmp/test-has-db.query.js |grep 'db.query' || (echo "--> js file no longer has db.query(), even though it was in use. it is now renamed to Car.query()"; exit 1)




