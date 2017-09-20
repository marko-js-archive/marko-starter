'use strict';

const pluginManager = require('~/src/plugin-manager');

module.exports = (project, hookName, args) => {
  // Notify plugins first
  let promise = pluginManager.triggerProjectHook(project, hookName);

  let hooks = project.getHooks()[hookName];

  if (!args) {
    args = [project];
  }

  hooks.forEach((hook) => {
    promise = promise.then(Promise.resolve(hook.apply(project, args)));
  });

  return promise;
};
