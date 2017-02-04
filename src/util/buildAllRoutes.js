const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const BuildResult = require('~/src/models/BuildResult');
const _buildRoute = require('./buildRoute');

module.exports = (project) => {
  let promise = Promise.resolve();

  const buildResult = new BuildResult();

  project.getRoutes().forEach((route) => {
    promise = promise.then(() => {
      const logger = project.getLogger();
      const outputDir = project.getOutputDir();
      const routePath = route.path;

      let relativeFilePath = path.join(routePath, 'index.html');
      let pageDir = path.join(outputDir, routePath);

      // if (routePath.charAt(routePath.length - 1) === '/') {
      //   // route path is for a "directory" so use index page
      //   relativeFilePath = path.join(routePath, 'index.html');
      //   pageDir = path.join(outputDir, routePath);
      // } else {
      //   // route path is for a "file" (no need for index page)
      //   pageDir = path.join(outputDir, path.dirname(routePath));
      // }

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

        // original route handler (if provided)
        handler: route.handler
      });
    });
  });

  return promise.then(() => {
    return buildResult;
  });
};
