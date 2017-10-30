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
  if (!plugins || !plugins.length) {
    return;
  }

  const pluginContext = {
    models: {
      Model: require('fashion-model/Model'),
      Enum: require('fashion-model/Enum'),
      primitives: require('fashion-model/primitives'),
      Project: Project
    }
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

exports.triggerProjectHook = (project, hookName) => {
  let promise = Promise.resolve();

  _plugins.forEach((plugin) => {
    let hook = plugin[hookName];

    if (hook) {
      promise = Promise.resolve(hook(project));
    }
  });

  return promise;
};
