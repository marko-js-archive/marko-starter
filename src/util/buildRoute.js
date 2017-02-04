module.exports = (options) => {
  const project = options.project;
  const route = options.route;
  const out = options.out;
  const logger = project.getLogger();

  return new Promise((resolve, reject) => {
    out.on('error', reject);
    out.on('finish', resolve);

    const input = {
      path: route.path,
      params: options.params || {},
      query: options.query || {},
      metadata: route.metadata || {}
    };

    logger.info(`Building page ${route.path}`);

    if (options.handler) {
      options.handler(input, out);
    } else if (route.template) {
      route.template.render(input, out);
    } else if (route.manifest) {
      // TODO: render manifest route
    } else {
      throw new Error(`Unable to build route at path ${route.path}. "handler", "template", or "manifest" property is required`);
    }
  }).then(() => {
    logger.success(`Finished building page ${route.path}`);
  }).catch((err) => {
    logger.error(`Error building page ${route.path}. Error: ${err.stack || err.toString()}`);
  });
};
