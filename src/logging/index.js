const chalk = require('chalk');

class Logger {
  constructor (name, options) {
    let prefix = `[marko-starter${name ? ' ' + name : ''}]`;
    this.prefix = prefix;
    this.console = (options && options.console) || console;
  }

  debug () {
    const len = arguments.length;
    const args = new Array(len + 1);
    args[0] = this.prefix;

    let i;
    for (i = 0; i < len; i++) {
      const arg = arguments[i];
      args[i + 1] = (arg.constructor === String) ? chalk.gray(arguments[i]) : arg;
    }

    this.console.log.apply(console, args);
  }

  info () {
    const len = arguments.length;
    const args = new Array(len + 1);
    args[0] = this.prefix;

    let i;
    for (i = 0; i < len; i++) {
      const arg = arguments[i];
      args[i + 1] = (arg.constructor === String) ? chalk.cyan(arguments[i]) : arg;
    }

    this.console.log.apply(console, args);
  }

  warn () {
    const len = arguments.length;
    const args = new Array(len + 1);
    args[0] = this.prefix;

    let i;
    for (i = 0; i < len; i++) {
      const arg = arguments[i];
      args[i + 1] = (arg.constructor === String) ? chalk.yellow(arguments[i]) : arg;
    }

    this.console.log.apply(console, args);
  }

  error () {
    const len = arguments.length;
    const args = new Array(len + 1);
    args[0] = this.prefix;

    let i;
    for (i = 0; i < len; i++) {
      const arg = arguments[i];
      args[i + 1] = (arg.constructor === String) ? chalk.red(arguments[i]) : arg;
    }

    this.console.error.apply(console, args);
  }

  success () {
    const len = arguments.length;
    const args = new Array(len + 1);
    args[0] = this.prefix;

    let i;
    for (i = 0; i < len; i++) {
      const arg = arguments[i];
      args[i + 1] = (arg.constructor === String) ? chalk.green(arguments[i]) : arg;
    }

    this.console.error.apply(console, args);
  }

  log () {
    const len = arguments.length;
    const args = new Array(len + 1);
    args[0] = this.prefix;

    let i;
    for (i = 0; i < len; i++) {
      const arg = arguments[i];
      args[i + 1] = arg;
    }

    this.console.error.apply(console, args);
  }
}

exports.logger = (name, options) => {
  return new Logger(name, options);
};
