const Raw = require('~/src/models/Raw');
const logging = require('~/src/logging');
const routeHandlerUtil = require('~/src/route-handler-util');
const path = require('path');
const DefaultsMixin = require('fashion-model-defaults');

/**
 * This is schema for a `Project` but plugins can modify this
 * before the project is loaded.
 *
 * @type {Object}
 */
module.exports = {
  mixins: [DefaultsMixin],
  properties: {
    name: {
      type: String,
      description: 'Name of project',
      default () {
        return this.getPackageManifestName() || 'app';
      }
    },

    routePathPrefix: {
      type: String,
      description: 'A path segment that is added to every route (e.g. "/my-app")',
      default: '/'
    },

    version: {
      type: String,
      description: 'Version of project'
    },

    dir: {
      type: String,
      description: 'Project directory',
      default: require('app-root-dir').get()
    },

    buildNumber: {
      type: Number,
      description: 'Build number',
      default () {
        let version = this.getVersion();
        return version.split('.')[2] || '0';
      }
    },

    colors: {
      type: Boolean,
      description: 'Use color in logging?',
      default () {
        return !this.getProduction();
      }
    },

    minify: {
      type: Boolean,
      description: 'Minify JavaScript and CSS?',
      default () {
        return this.getProduction();
      }
    },

    minifyCss: {
      type: Boolean,
      description: 'Minify CSS? (overrides "minify" option)'
    },

    minifyJs: {
      type: Boolean,
      description: 'Minify JavaScript? (overrides "minify" option)'
    },

    fingerPrintsEnabled: {
      type: Boolean,
      description: 'Fingerprint build artifacts?'
    },

    production: {
      type: Boolean,
      description: 'Build for production?',
      default: require('~/src/util/isProduction')
    },

    flags: {
      type: [String],
      description: 'Build flags'
    },

    outputDir: {
      type: String,
      description: 'Output directory for built files'
    },

    staticUrlPrefix: {
      type: String,
      description: 'URL prefix for static assets'
    },

    /***************************************************************************
    //  No configuration properties below.
    //  The `configuration: false` property is used to hide this property
    //  from the end-user.
    ***************************************************************************/
    packageManifest: {
      type: Raw,
      description: 'Contents of package.json associated with project',
      configurable: false
    },

    logger: {
      type: Raw,
      description: 'The logger associated with this project',
      configurable: false
    },

    tasks: {
      type: [Raw],
      description: 'Tasks to run when project starts',
      configurable: false
    },

    hooks: {
      type: Raw,
      description: 'All hooks that have been registered',
      configurable: false
    },

    routes: {
      type: [Raw],
      description: 'Routes that have been added to this project',
      configurable: false
    }
  },

  prototype: {
    addRoutes (routes) {
      let existingRoutes = this.getRoutes();
      let routePathPrefix = this.getRoutePathPrefix();

      for (let route of routes) {
        if (!route.path) {
          throw new Error('"path" is required for route');
        }

        if (routePathPrefix) {
          route.path = path.join(routePathPrefix, route.path);
        }

        // When using `path` functions on Windows, forward slashes get replaced
        // with double back slashes.
        route.path = route.path.replace(/\\/g, '/');
        existingRoutes.push(route);
      }
    },

    logger (name) {
      return logging.logger(this.getName() + ' ' + name, {
        colors: this.getColors()
      });
    },

    getRouteHandlerUtil () {
      // This is used by plugins to handle/render a route
      return routeHandlerUtil;
    },

    getPackageManifestName () {
      const packageManifest = this.getPackageManifest();
      return packageManifest && packageManifest.name;
    }
  }
};
