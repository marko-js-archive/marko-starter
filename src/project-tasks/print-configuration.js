const chalk = require('chalk');

module.exports = {
  name: 'print-configuration',
  run: function (project) {
    let logger = project.getLogger();
    let rawConfig = project.clean();

    let keyValuePairs = [];

    project.constructor.forEachProperty((property) => {
      if (property.configurable !== false) {
        let key = property.getKey();
        let value = rawConfig[key];
        if (value == null) {
          value = chalk.gray('(not set)');
        } else {
          if (typeof value === 'object') {
            value = JSON.stringify(value, null, '  ').split('\n').map((line) => {
              return '  ' + line;
            }).join('\n');
          }
          value = chalk.cyan(value.toString());
        }

        keyValuePairs.push([chalk.yellow(key), value]);
      }
    });

    logger.info('\nCONFIGURATION:\n' + keyValuePairs.map(function (pair) {
      return '  ' + pair[0] + ': ' + pair[1];
    }).join('\n'));
  }
};
