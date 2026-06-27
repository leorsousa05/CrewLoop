#!/usr/bin/env node
const { run } = require('../dist/cli');

run(process.argv.slice(2)).then((exitCode) => {
  process.exit(exitCode);
});
