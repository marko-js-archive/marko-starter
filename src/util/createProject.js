const path = require('path');
const logging = require('~/src/logging');
const Model = require('fashion-model');
const ProjectSchema = require('~/src/models/Project');
const pluginManager = require('~/src/plugin-manager');

// Utility functions
const _applyProjectDefaults = require('./applyProjectDefaults');
const _loadFilesystemRoutes = require('./loadFilesystemRoutes');

let PROJECT_HOOKS = [
  'beforeStart'
];

function _findHooks (config, additionalConfig) {
  let hookLookup = {};

  PROJECT_HOOKS.forEach((hookName) => {
    let hooks;
    hookLookup[hookName] = hooks = [];

    [config, additionalConfig].forEach((curConfig) => {
      if (curConfig) {
        let hook = curConfig[hookName];
        if (hook) {
          hooks.push(hook);
        }

        delete curConfig[hookName];
      }
    });
  });

  return hookLookup;
}


module.exports = (config, configOverrides) => {
  let hooks = _findHooks(config, configOverrides);

  config = Object.assign({}, config, configOverrides);

  if (config.colors) {
    require('colors');
  }

  let errors = [];
  let Project = Model.extend(ProjectSchema);
  let project = new Project(config, errors);

  if (errors.length) {
    return Promise.reject(new Error(`Invalid project configuration. Errors: ${errors.join(', ')}`));
  }

  project.setHooks(hooks);

  try {
    project.setPackageManifest(require(path.join(project.getDir(), 'package.json')));
  } catch (e) {
    project.setPackageManifest({});
  }

  _applyProjectDefaults(project);

  project.setLogger(logging.logger(project.getName(), {
    colors: config.colors
  }));

  project.setTasks([
    require('~/src/project-tasks/print-configuration'),
    require('~/src/project-tasks/configure-default-lasso')
  ]);

  project.setRoutes([]);

  return pluginManager.notifyProjectCreated(project)
    .then(() => {
      return _loadFilesystemRoutes(project).then((routes) => {
        project.addRoutes(routes);
      });
    })
    .then(() => {
      return project;
    });
};
