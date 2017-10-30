const chalk = require('chalk');
const isProduction = require('../src/util/isProduction');
const fork = require('child_process').fork;

function _helpInColor (command, help) {
  console.log(chalk.green(command) + ': ' + chalk.yellow(help));
}

const commands = module.exports = {
  'build': {
    help: 'Builds the project',
    execute () {
      require('./build').run();
    }
  },

  'server': {
    help: 'Starts a server in the present working directory',
    execute ({ execArgs, args }) {
      const serverPath = require.resolve('./server');
      if (isProduction || args.indexOf('--no-watch') !== -1) {
        if (execArgs.length) {
          fork(serverPath, args, { execArgv: execArgs });
        } else {
          require(serverPath);
        }
      } else {
        require('browser-refresh').start({
          script: serverPath,
          delay: 3000,
          execArgs,
          args
        });
      }
    }
  },

  'help': {
    help: 'Shows this help message',
    execute () {
      console.log('marko-starter commands:\n');
      for (var commandKey in commands) {
        if (commands.hasOwnProperty(commandKey)) {
          const help = commands[commandKey].help;
          _helpInColor(commandKey, help);
        }
      }

      process.exit(0);
    }
  },

  'serve-static': {
    help: 'Serve the directory with the statically built application',
    execute () {
      require('./serve-static');
    }
  }
};
