'use strict';

class Logger {
  constructor (name, options) {
    let prefix = `[marko-starter ${name}] `;
    this.colors = options && options.colors;
    this.prefix = prefix;
  }

  debug (message) {
    let prefix = this.prefix;
    if (this.colors) {
      prefix = prefix.gray;
    }
    console.log(prefix + message);
  }

  success (message) {
    let prefix = this.prefix;
    if (this.colors) {
      prefix = prefix.green;
    }
    console.log(prefix + message);
  }

  info (message) {
    let prefix = this.prefix;
    if (this.colors) {
      prefix = prefix.cyan;
    }
    console.log(prefix + message);
  }

  error (message) {
    let prefix = this.prefix;
    if (this.colors) {
      prefix = prefix.red;
    }
    console.error(prefix + message);
  }
}

exports.logger = (name, options) => {
  return new Logger(name, options);
};
