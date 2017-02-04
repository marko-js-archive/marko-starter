function _initializeDefault (model, propertyName, defaultProvider) {
  let value = model.get(propertyName);
  if (value === undefined) {
    model.set(propertyName, defaultProvider());
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

  _initializeDefault(project, 'production', () => {
    const NODE_ENV = process.env.NODE_ENV;
    return (NODE_ENV != null) && (NODE_ENV.toLowerCase() !== 'development');
  });
};
