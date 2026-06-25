#!/usr/bin/env node
const path = require('node:path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.js');
require(distIndex);
