require('./env-check');

const path = require('path');
const projectDir = require('app-root-dir').get();

try {
  require(path.join(projectDir, 'server'));
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }

  // Use our default server
  require('./project').server();
}
