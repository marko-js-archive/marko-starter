/**
 * HTTP server plugins use the following call to build a route:
 *
 * ```javascript
 * project.getRouteHandlerUtil().buildRoute({
 *   route: route, // the original route
 *   params: params, // path parameters
 *   query: query, // the query string parameters
 *   handler: handler // a handler that will be used to handle route
 * })
 * ```
 *
 * build a route when a new request is received.
 */
exports.buildRoute = require('./util/buildRoute');
