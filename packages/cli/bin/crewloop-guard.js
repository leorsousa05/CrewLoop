#!/usr/bin/env node

const { runGuard } = require('../dist/guard/index.js');

runGuard(process.argv)
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch(() => {
    process.exitCode = 0;
  });
