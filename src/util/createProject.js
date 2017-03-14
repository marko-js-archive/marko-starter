'use strict';

const path = require('path');
const logging = require('~/src/logging');
const Model = require('fashion-model');
const ProjectSchema = require('~/src/models/Project');

const _loadFilesystemRoutes = require('./loadFilesystemRoutes');
const _triggerProjectHook = require('./triggerProjectHook');

const DEFAULT_PROJECT_VERSION = '0.0.0';

let PROJECT_HOOKS = [
  'beforeStart',
  'projectCreated'
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

  const packageManifest = project.getPackageManifest();
  const version = (packageManifest && packageManifest.version) || DEFAULT_PROJECT_VERSION;

  project.setVersion(version);
  project.applyDefaults();

  if (project.getColors()) {
    require('colors');
  }

  project.setLogger(logging.logger(project.getName(), {
    colors: config.colors
  }));

  project.setTasks([
    require('~/src/project-tasks/print-configuration')
  ]);

  project.setRoutes([]);

  return _triggerProjectHook(project, 'projectCreated')
    .then(() => {
      return _loadFilesystemRoutes(project).then((routes) => {
        project.addRoutes(routes);
      });
    })
    .then(() => {
      return project;
    });
};
