const fs = require('fs');
const chalk = require('chalk');
const walkDir = require('~/src/util/walkDir');
const path = require('path');
const logger = require('~/src/logging').logger();
const sortRoutes = require('~/src/util/sortRoutes');

const SEARCH_PATHS = [
  'src/routes',
  'src/apps',
  'src'
];

const VALID_ROUTE_PROPERTY_LOOKUP = {
  path: 1,
  params: 1,
  handler: 1,
  metadata: 1,
  template: 1
};

const VALID_ROUTE_PROPERTIES = Object.keys(VALID_ROUTE_PROPERTY_LOOKUP);

function simpleCombinePaths (parentRoutePath, childRoutePath) {
  let result = parentRoutePath;

  if (!parentRoutePath.endsWith('/')) {
    result += '/';
  }

  result += childRoutePath;

  return result;
}

function toArray (val) {
  return Array.isArray(val) ? val : [val];
}

function combinePaths (parentRoutePath, childRoutePath) {
  if (Array.isArray(parentRoutePath) || Array.isArray(childRoutePath)) {
    // Since parent route and the child route both might declare
    // an array of paths, we have to handle all permutations
    // of parent route path and child route path.
    const result = [];
    const parentPaths = toArray(parentRoutePath);
    const childPaths = toArray(childRoutePath);

    for (const parentPath of parentPaths) {
      for (const childPath of childPaths) {
        result.push(simpleCombinePaths(parentPath, childPath));
      }
    }

    return result;
  } else {
    // Simple case: parent route path and child route path are simple strings
    return simpleCombinePaths(parentRoutePath, childRoutePath);
  }
}

module.exports = (project) => {
  let baseDir;

  for (const dir of SEARCH_PATHS) {
    const dirAbsolute = path.join(project.getDir(), dir);
    const dirStat = fs.statSync(dirAbsolute);

    if (dirStat.isDirectory()) {
      baseDir = dirAbsolute;
      break;
    }
  }

  if (!baseDir) {
    throw new Error('Could not find base directory for routes. Use one of the following folders:\n' + SEARCH_PATHS.map((dir) => {
      return chalk.bold(dir);
    }).join('\n'));
  }

  logger.info(`Searching routes in directory ${chalk.bold(baseDir)}...`);

  const routes = [];
  const routeByDir = {};

  function getRouteByDir (dir) {
    let route = routeByDir[dir];
    if (!route) {
      route = (routeByDir[dir] = {
        path: undefined,
        template: undefined,
        metadata: undefined,
        _: {
          __dirname: path.join(baseDir, dir),
          dir
        }
      });
      routes.push(route);
    }
    return route;
  }

  const FileType = {
    INDEX_MARKO: {
      handleFileEntry (fileEntry) {
        const {route, file} = fileEntry;
        route.template = require(file);
      }
    },
    ROUTE_JS: {
      handleFileEntry (fileEntry) {
        const {route, file} = fileEntry;
        const routeProperties = require(file);
        Object.assign(route, routeProperties);
      }
    }
  };

  return walkDir(baseDir, {
    onFile (file, stat) {
      const fileName = path.basename(file);
      let fileType;

      // See if the file is something that we care about...
      if (fileName === 'index.marko') {
        // file is an index.marko template
        fileType = FileType.INDEX_MARKO;
      } else if (fileName === 'route.js') {
        // file is a route.js definition file
        fileType = FileType.ROUTE_JS;
      }

      if (fileType) {
        const relativeFile = file.substring(baseDir.length + 1);
        const lastSepPos = relativeFile.lastIndexOf(path.sep);
        const relativeDir = (lastSepPos === -1) ? '' : relativeFile.substring(0, lastSepPos);

        fileType.handleFileEntry({
          route: getRouteByDir(relativeDir),
          relativeFile,
          relativeDir,
          file
        });
      }
    }
  }).then(() => {
    const errors = [];

    // sort by route directory (this is so that we can automatically build path
    // and we need to process paths starting from the root)
    routes.sort((r1, r2) => {
      return r1._.dir.localeCompare(r2._.dir);
    });

    for (const route of routes) {
      const illegalProperties = [];
      const properties = Object.keys(route);
      for (const prop of properties) {
        if ((prop !== '_') && !VALID_ROUTE_PROPERTY_LOOKUP[prop]) {
          illegalProperties.push(prop);
        }
      }

      if (illegalProperties.length) {
        errors.push(`Route at path ${chalk.bold(route._.dir)} has the following illegal properties:\n` +
          illegalProperties.map((illegalProp) => {
            return '- ' + chalk.bold(illegalProp);
          }).join('\n') + '\n\nAllowed properties:\n' +
          VALID_ROUTE_PROPERTIES.map((allowedProp) => {
            return '- ' + chalk.bold(allowedProp);
          }).join('\n'));
      }

      if (route.handler) {
        // route has a user-provided handler so don't need to provide our own
      } else if (route.template) {
        // create a route handler that renders via the template
        const template = route.template;
        route.handler = (input, out) => {
          return template.render(input, out);
        };
      } else {
        errors.push(`Route at path ${chalk.bold(route._.dir)} does not have a ${chalk.bold('handler')} property in ${chalk.bold('route.js')} file or a ${chalk.bold('index.marko')} template file.`);
      }

      // split the current routes relative directory at the path separator
      const dirParts = route._.dir.split(path.sep);

      // find the closest parent route
      //
      // For example:
      // Current route directory: 'a/b/c' (numParts=3)
      //
      // We will try:
      // 1) a/b
      // 2) a
      // 3) (empty string)
      //
      //
      // Let's say that we then find a parent route at 'a' (numParts=1)
      //
      // The route path at 'a/b/c' will then be route path of 'a' plus
      // 'b/c'
      let curParentDirNumParts = dirParts.length;
      let parentRoutePath = '/';
      while (--curParentDirNumParts >= 0) {
        const parentDirPath = dirParts.slice(0, curParentDirNumParts).join(path.sep);
        const parentRoute = routeByDir[parentDirPath];
        if (parentRoute) {
          parentRoutePath = parentRoute.path || '/';
          break;
        }
      }

      const childRoutePath = route.path ||
        // child route path will be the directories in between parent route and child route
        dirParts.slice(curParentDirNumParts).join('/');

      route.path = combinePaths(parentRoutePath, childRoutePath);
    }

    if (errors.length) {
      const err = new Error('Errors were found in routes:\n' + errors.join('\n'));
      delete err.stack;
      throw err;
    }

    const finalRoutes = [];

    for (const route of routes) {
      delete route._;

      // Expand routes whose `path` property value is an array of paths
      if (Array.isArray(route.path)) {
        for (const routePath of route.path) {
          finalRoutes.push(Object.assign({}, route, {
            path: routePath
          }));
        }
      } else {
        finalRoutes.push(route);
      }
    }

    sortRoutes(finalRoutes);

    logger.success(`Finished search for routes in directory ${chalk.bold(baseDir)}`);

    return finalRoutes;
  });
};
