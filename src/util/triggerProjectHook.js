module.exports = (project, hookName) => {
  let logger = project.getLogger();
  logger.debug(`Triggering "${hookName}"`);

  let promise = Promise.resolve();
  let hooks = project.getHooks()[hookName];

  logger.debug(`Triggering "${hookName}". Listeners: ${hooks.length}`);

  hooks.forEach((hook) => {
    promise = promise.then(Promise.resolve(hook(project)));
  });
  return promise;
};
