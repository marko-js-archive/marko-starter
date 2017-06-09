'use strict';

require('./env-check');

const path = require('path');
const projectDir = require('app-root-dir').get();

exports.run = () => {
  try {
    return require(path.join(projectDir, 'build'));
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }

    // Use our default build
    return require('./project').build();
  }
};
