const _createLassoConfig = require('~/src/util/createLassoConfig');

module.exports = {
  name: 'configure-lasso',
  run: function (project) {
    require('lasso').configure(_createLassoConfig(project));
  }
};
