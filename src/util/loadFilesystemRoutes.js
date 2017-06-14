'use strict';

const fs = require('fs');
const path = require('path');
const routesTable = require('routes-table');
const tryRequire = require('try-require');

module.exports = (project) => {
  const rootDir = project.getDir();
  const srcDir = path.join(rootDir, 'src');
  const routesDir = fs.existsSync(srcDir) ? srcDir : rootDir;

  return routesTable.build(routesDir, {
    index: true,
    onRoute (route) {
      if (route.handler) {
        return route;
      }

      let templatePath;
      let template = route.template;

      if (template) {
        delete route.template;
      } else {
        templatePath = path.join(route.__dirname, 'index.marko');
        template = tryRequire(templatePath);

        // Ignore a route that does not have a template, but has a sub-routes
        if (!template && route.subRoutesExist) {
          return false;
        } else if (!template && !route.subRoutesExist) {
          throw new Error(
            'A route must contain a `route.js` file that exports a template ' +
            'or handler, or the route must contain an `index.marko` file. \n' +
            'At: ' + route.__dirname
          );
        }
      }

      route.handler = (input, out) => {
        return template.render(input, out);
      };
    }
  });
};
