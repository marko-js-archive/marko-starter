module.exports = {
  name: 'print-configuration',
  run: function (project) {
    let logger = project.getLogger();
    let colorsEnabled = project.getColors();
    let rawConfig = project.clean();

    let keyValuePairs = [];

    project.constructor.forEachProperty((property) => {
      if (property.configurable !== false) {
        let key = property.getKey();
        let value = rawConfig[key];
        if (value == null) {
          value = '(not set)';
          if (colorsEnabled) {
            value = value.grey;
          }
        } else {
          if (typeof value === 'object') {
            value = JSON.stringify(value, null, '  ').split('\n').map((line) => {
              return '  ' + line;
            }).join('\n');
          }
          if (colorsEnabled) {
            value = value.toString().cyan;
          }
        }

        if (colorsEnabled) {
          key = key.yellow;
        }

        keyValuePairs.push([key, value]);
      }
    });

    logger.info('\nCONFIGURATION:\n' + keyValuePairs.map(function (pair) {
      return '  ' + pair[0] + ': ' + pair[1];
    }).join('\n'));
  }
};
