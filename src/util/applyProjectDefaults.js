function _initializeDefault (model, propertyName, defaultValue) {
  let value = model.get(propertyName);
  if (value === undefined) {
    if (typeof defaultValue === 'function') {
      defaultValue = defaultValue();
    }
    model.set(propertyName, defaultValue);
  }
}

module.exports = (project) => {
  let packageManifest = project.getPackageManifest();

  _initializeDefault(project, 'dir', () => {
    return require('app-root-dir').get();
  });

  _initializeDefault(project, 'version', () => {
    return packageManifest.version || '0.0.0';
  });

  _initializeDefault(project, 'buildNumber', () => {
    let version = project.getVersion();
    return version.split('.')[2] || '0';
  });

  let version = project.getVersion().toString();
  version = version.replace(/(\d+\.\d+\.)\d+(.*)/, function (match, firstPart, lastPart) {
    return firstPart + project.getBuildNumber() + lastPart;
  });

  project.setVersion(version);

  _initializeDefault(project, 'name', () => {
    return packageManifest.name || 'app';
  });

  _initializeDefault(project, 'routePathPrefix', () => {
    return '/' + project.getName();
  });

  _initializeDefault(project, 'production', () => {
    const NODE_ENV = process.env.NODE_ENV;
    return (NODE_ENV != null) && !NODE_ENV.toLowerCase().startsWith('dev');
  });

  _initializeDefault(project, 'colors', () => {
    return !project.getProduction();
  });

  _initializeDefault(project, 'minify', () => {
    return project.getProduction();
  });

  project.constructor.forEachProperty((property) => {
    let value = project.get(property.getKey());
    if ((value === undefined) && property.defaultValue) {
      _initializeDefault(project, property.getKey(), property.defaultValue);
    }
  });
};
