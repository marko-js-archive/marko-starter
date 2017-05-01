'use strict';

/*
Allow requiring paths relative to the root of the project:
require('~/src');
*/
require('require-self-ref');

// The following line installs the Node.js require extension
// for `.marko` files. Once installed, `*.marko` files can be
// required just like any other JavaScript modules.
require('marko/node-require').install();
require('marko/compiler/config').meta = true;
require('lasso/node-require-no-op').enable('.css', '.less', '.styl', '.scss', '.sass');

/*
Browser Refresh
*/
require('marko/browser-refresh').enable();
require('lasso/browser-refresh').enable('*.marko *.css *.less *.styl *.scss *.sass *.png *.jpeg *.jpg *.gif *.webp *.svg');

const path = require('path');
const rimraf = require('rimraf');
const logging = require('~/src/logging');
const pluginManager = require('~/src/plugin-manager');

// Utility functions:
const _createProject = require('~/src/util/createProject');
const _runProjectTasks = require('~/src/util/runProjectTasks');
const _triggerProjectHook = require('~/src/util/triggerProjectHook');

let userPlugins;

/**
 * This function is used to install custom plugins that will be used
 * to configure and customize marko-starter.
 *
 * @param  {Array} plugins an array of module names that will be loaded that
 *                         implement the plugin interface methods
 */
exports.plugins = (plugins) => {
  userPlugins = plugins;
};

pluginManager.installPlugins(['marko-starter-lasso']);

/**
 * This method is used to supply the project configuration.
 *
 * @param  {Object} config an object with project configuration
 * @return {Object} an object with a `server(config)` and `build(config)` method
 */
exports.projectConfig = (config) => {
  config = config || {};

  return {
    server (serverConfig) {
      let beforeStartPromise = Promise.resolve();

      if (config.beforeStartServer) {
        beforeStartPromise = beforeStartPromise.then(() => {
          return config.beforeStartServer();
        });
      }

      return beforeStartPromise
        .then(() => {
          pluginManager.installPlugins(userPlugins);

          if (!pluginManager.isFeatureProvided('http-server')) {
            pluginManager.installPlugins(['marko-starter-generic-server']);
          }

          let logger = logging.logger('init');

          return _createProject(config, serverConfig).then((project) => {
            logger = project.getLogger();

            logger.info('Starting server...');

            if (!project.getOutputDir()) {
              project.setOutputDir(path.join(project.getDir(), '.cache/static'));
            }

            if (!project.getStaticUrlPrefix()) {
              project.setStaticUrlPrefix('/static/');
            }

            return _runProjectTasks(project)
              .then(() => {
                return _triggerProjectHook(project, 'beforeStart');
              })
              .then(() => {
                // `startServer` is provided by plugin
                return project.startServer();
              })
              .then(() => {
                return _triggerProjectHook(project, 'afterServerStarted');
              });
          }).catch((err) => {
            logger.error(`Error starting server. ${err.stack || err}`);
            process.exit(1);
          });
        });
    },

    build (buildConfig) {
      let beforeBuildPromise = Promise.resolve();

      if (config.beforeBuild) {
        beforeBuildPromise = beforeBuildPromise.then(() => {
          return config.beforeBuild();
        });
      }

      return beforeBuildPromise
        .then(() => {
          const _buildAllRoutes = require('~/src/util/buildAllRoutes');

          pluginManager.installPlugins(userPlugins);

          let logger = logging.logger('init');

          return _createProject(config, buildConfig).then((project) => {
            logger = project.getLogger();

            logger.info('Building...');

            if (!project.getOutputDir()) {
              project.setOutputDir(path.join(project.getDir(), 'dist'));
            }

            if (!project.getStaticUrlPrefix()) {
              project.setStaticUrlPrefix('/');
            }

            rimraf.sync(project.getOutputDir());

            return _runProjectTasks(project)
              .then(() => {
                return _triggerProjectHook(project, 'beforeStart');
              })
              .then(() => {
                return _buildAllRoutes(project);
              })
              .then(() => {
                return _triggerProjectHook(project, 'afterBuild');
              });
          }).then((buildResult) => {
            logger.success('Build complete');
            return buildResult;
          }).catch((err) => {
            logger.error(`Error building project. ${err.stack || err}`);
            process.exit(1);
          });
        });
    }
  };
};
