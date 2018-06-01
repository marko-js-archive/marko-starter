'use strict';

module.exports = (options) => {
  const project = options.project;
  const route = options.route;
  const out = options.out;
  const logger = project.getLogger();
  const path = options.path || route.path;

  return new Promise((resolve, reject) => {
    out.on('error', reject);
    out.on('finish', resolve);

    const input = {
      path,
      params: options.params || {},
      query: options.query || {},
      metadata: route.metadata || {}
    };

    logger.info(`Building page ${path}...`);

    if (options.handler) {
      options.handler(input, out);
    } else if (route.template) {
      route.template.render(input, out);
    } else if (route.manifest) {
      // TODO: render manifest route
    } else {
      throw new Error(`Unable to build route at path ${path}. "handler", "template", or "manifest" property is required`);
    }
  }).then(() => {
    logger.success(`Finished building page ${path}`);
  }).catch((err) => {
    logger.error(`Error building page ${path}. Error: ${err.stack || err.toString()}`);
    throw err;
  });
};
