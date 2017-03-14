'use strict';

const path = require('path');
const projectDir = require('app-root-dir').get();
const tryRequire = require('try-require');

let project = tryRequire(path.join(projectDir, 'project'), require);

if (!project) {
  project = require('../index').projectConfig({
    dir: require('app-root-dir').get()
  });
}

module.exports = project;
