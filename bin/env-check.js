const colors = require('colors/safe');

const projectDir = require('app-root-dir').get();
const resolveFrom = require('resolve-from');

const markoPath = resolveFrom(projectDir, 'marko');
if (!markoPath) {
  console.error(colors.red('marko does not appear to be installed.'));
  console.log(colors.red('Did you forget to run `npm install` or `yarn install`?'));
  process.exit(1);
}
