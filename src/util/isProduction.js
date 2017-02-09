const NODE_ENV = process.env.NODE_ENV;
const isProduction = (NODE_ENV != null) && (NODE_ENV.toLowerCase() !== 'development');
module.exports = isProduction;
