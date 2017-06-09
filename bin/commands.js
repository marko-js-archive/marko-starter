'use strict';

const colors = require('colors/safe');
const isProduction = require('../src/util/isProduction');

function _helpInColor (command, help) {
  console.log(colors.green(command) + ': ' + colors.yellow(help));
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
    execute () {
      if (isProduction) {
        require('./server');
      } else {
        require('browser-refresh').start({
          script: require.resolve('./server'),
          delay: 3000,
          execArgs: [],
          args: []
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
      require('./serve');
    }
  }
};
