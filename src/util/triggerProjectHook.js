'use strict';

const pluginManager = require('~/src/plugin-manager');
module.exports = (project, hookName) => {
  // Notify plugins first
  let promise = pluginManager.triggerProjectHook(project, hookName);

  let hooks = project.getHooks()[hookName];

  hooks.forEach((hook) => {
    promise = promise.then(Promise.resolve(hook(project)));
  });

  return promise;
};
