const logging = require('~/src/logging');
const Project = require('~/src/models/Project');

let logger = logging.logger('plugins');
const _plugins = [];

exports.isFeatureProvided = (featureName) => {
  let filter = (plugin) => {
    return (plugin.provides) && (plugin.provides.indexOf(featureName) !== -1);
  };

  return (_plugins.find(filter) !== undefined);
};

exports.installPlugins = (plugins) => {
  const pluginContext = {
    models: {
      Model: require('fashion-model/Model'),
      Integer: require('fashion-model/Integer'),
      Enum: require('fashion-model/Enum')
    },
    Project: Project
  };

  plugins.forEach((plugin, index) => {
    let pluginName;
    if (typeof plugin === 'string') {
      pluginName = plugin;
      plugin = require(plugin);
    }

    plugin.name = plugin.name || pluginName || index.toString();

    plugin.install(pluginContext);

    logger.info(`Installed plugin: ${plugin.name}`);

    _plugins.push(plugin);
  });
};

exports.notifyProjectCreated = (project) => {
  let promise = Promise.resolve();

  _plugins.forEach((plugin) => {
    if (plugin.projectCreated) {
      promise = Promise.resolve(plugin.projectCreated(project));
    }
  });

  return promise;
};
