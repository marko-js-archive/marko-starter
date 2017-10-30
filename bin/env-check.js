const chalk = require('chalk');

const projectDir = require('app-root-dir').get();
const resolveFrom = require('resolve-from');

const markoPath = resolveFrom(projectDir, 'marko');
if (!markoPath) {
  console.error(chalk.red('marko does not appear to be installed.'));
  console.log(chalk.red('Did you forget to run `npm install` or `yarn install`?'));
  process.exit(1);
}
