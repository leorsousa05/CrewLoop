#!/usr/bin/env node

const { runGuard } = require('../dist/guard/index.js');

runGuard(process.argv)
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch(() => {
    process.exit(0);
  });
