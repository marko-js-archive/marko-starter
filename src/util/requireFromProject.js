const chalk = require('chalk');
const projectDir = require('app-root-dir').get();
const resolveFrom = require('resolve-from');

module.exports = (dep) => {
  const depPath = resolveFrom(projectDir, dep);
  if (!depPath) {
    const err = new Error(`Cannot find module ${chalk.bold(dep)} in project. Did you install ${chalk.bold(dep)}?`);
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }

  return require(depPath);
};
