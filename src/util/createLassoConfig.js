function _chooseNotNull () {
  for (let i = 0; i < arguments.length; i++) {
    var value = arguments[i];
    if (value != null) {
      return value;
    }
  }

  return undefined;
}

module.exports = (project, userProvidedLassoConfig) => {
  const lassoConfig = {};

  if (userProvidedLassoConfig) {
    Object.assign(lassoConfig, userProvidedLassoConfig);
  }

  const minify = _chooseNotNull(project.minify, project.getMinify());

  lassoConfig.outputDir =
    _chooseNotNull(
      lassoConfig.outputDir,
      project.getOutputDir());

  lassoConfig.urlPrefix =
    _chooseNotNull(
      lassoConfig.urlPrefix,
      project.getStaticUrlPrefix());

  lassoConfig.bundlingEnabled =
    _chooseNotNull(
      lassoConfig.bundlingEnabled,
      project.getProduction());

  lassoConfig.fingerprintsEnabled =
    _chooseNotNull(
      lassoConfig.fingerprintsEnabled,
      project.getFingerPrintsEnabled(),
      lassoConfig.bundlingEnabled,
      project.getProduction());

  lassoConfig.minifyJS =
    _chooseNotNull(
      lassoConfig.minifyJS,
      project.getMinifyJs(),
      minify,
      project.getProduction());

  lassoConfig.minifyCSS =
    _chooseNotNull(
      lassoConfig.minifyCSS,
      project.getMinifyCss(),
      minify,
      project.getProduction());

  lassoConfig.flags =
    _chooseNotNull(
      lassoConfig.flags,
      project.getFlags());

  lassoConfig.cacheProfile =
    _chooseNotNull(
      lassoConfig.cacheProfile,
      project.getProduction() ? 'production' : 'development');

  lassoConfig.plugins =
    _chooseNotNull(
      lassoConfig.plugins,
      [
        require('lasso-marko'),
        require('lasso-less')
      ]);

  return lassoConfig;
};
