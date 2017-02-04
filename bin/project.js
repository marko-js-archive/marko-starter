const path = require('path');
const projectDir = require('app-root-dir').get();

let project;

try {
  project = require(path.join(projectDir, 'project'));
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }

  project = require('../index').projectConfig({
    dir: require('app-root-dir').get()
  });
}

module.exports = project;
