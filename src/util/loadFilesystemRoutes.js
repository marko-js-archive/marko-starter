'use strict';

const fs = require('fs');
const path = require('path');
const routesTable = require('routes-table');

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
        try {
          templatePath = path.join(route.__dirname, 'index.marko');
          template = require(templatePath);
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND' || !e.message.includes(templatePath)) {
            throw e;
          }
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
