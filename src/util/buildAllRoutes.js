const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const reversePath = require('reverse-path');
const BuildResult = require('~/src/models/BuildResult');
const _buildRoute = require('./buildRoute');

module.exports = (project) => {
  const buildResult = new BuildResult();
  const routes = project.getRoutes();

  let promise = Promise.all(routes.map((route) => {
    if (!route.params || !route.params.length) {
      return buildRoute(project, route, buildResult);
    }

    return Promise.all(route.params.map((params) =>
      buildRoute(project, route, buildResult, params)
    ));
  }));

  return promise.then(() => buildResult);
};

function buildRoute (project, route, buildResult, params) {
  const logger = project.getLogger();
  const outputDir = project.getOutputDir();
  const routePath = reversePath(route.path, params);

  let relativeFilePath = path.join(routePath, 'index.html');
  let pageDir = path.join(outputDir, routePath);

  // normalize file system paths
  relativeFilePath = path.normalize(relativeFilePath);
  pageDir = path.normalize(pageDir);

  const outputFile = path.join(outputDir, relativeFilePath);

  logger.info('Building ' + routePath + ' to ' + outputFile + '...');

  buildResult.addToRoutes({
    url: routePath,
    path: routePath,
    file: relativeFilePath
  });

  mkdirp.sync(pageDir);

  const out = fs.createWriteStream(outputFile);

  return _buildRoute({
    project,
    route,
    out,
    params,

    // path with params filled in
    path: routePath,

    // original route handler (if provided)
    handler: route.handler
  });
}
