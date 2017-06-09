'use strict';

require('./env-check');

const path = require('path');
const fs = require('fs');
const fork = require('child_process').fork;
const projectDir = require('app-root-dir').get();
const runBuild = require('./build').run;

const tryRequire = require('try-require');
const httpServerPath = path.join(require.resolve('http-server'), '../../bin/http-server');
const args = process.argv;

const DEFAULT_DIST_DIR = path.join(projectDir, 'dist');

function forkHttpServerProcess (distDir) {
  distDir = distDir || DEFAULT_DIST_DIR;
  // Pass along process arguments to `http-server`
  let httpArgs = args.slice(3, args.length);
  let forkArgs = [`${distDir}`].concat(httpArgs);
  fork(`${httpServerPath}`, forkArgs);
}

function buildAndFork (distDir) {
  runBuild()
    .then(() => forkHttpServerProcess(distDir))
    .catch((err) => {
      console.error(`Error running 'marko-starter serve-static': `, err);
      throw err;
    });
}

// Check if the default `dist` directory exists, and if it does, we will just
// serve that directory
if (fs.existsSync(DEFAULT_DIST_DIR)) {
  forkHttpServerProcess();
} else {
  let project = tryRequire(path.join(projectDir, 'project'), require);

  if (project) {
    const userConfig = project.getUserConfig();
    let outputDir = userConfig.outputDir;

    if (outputDir) {
      if (fs.existsSync(outputDir)) {
        forkHttpServerProcess(outputDir);
      } else {
        buildAndFork();
      }
    } else {
      buildAndFork();
    }
  } else {
    buildAndFork();
  }
}
