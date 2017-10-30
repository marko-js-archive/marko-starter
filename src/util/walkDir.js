const findit = require('findit');

const DEFAULT_OPTIONS = {
  followSymlinks: true
};

module.exports = async (dir, options) => {
  return new Promise((resolve, reject) => {
    let pending = 0;
    let finderDone = false;

    function checkDone () {
      if (finderDone && (pending === 0)) {
        resolve();
      }
    }

    function onResolve () {
      pending--;
      checkDone();
    }

    const finder = findit(dir, options || DEFAULT_OPTIONS);

    if (options.filterDir) {
      finder.filterDir(options.filterDir);
    }

    if (options.onDirectory) {
      finder.on('directory', (dir, stat, stop) => {
        pending++;
        Promise.resolve(options.onDirectory(dir, stat)).then(onResolve).catch(reject);
      });
    }

    if (options.onFile) {
      finder.on('file', (file, stat) => {
        pending++;
        Promise.resolve(options.onFile(file, stat)).then(onResolve).catch(reject);
      });
    }

    if (options.onSymlink) {
      finder.on('link', (file, stat) => {
        pending++;
        Promise.resolve(options.onSymlink(file, stat)).then(onResolve).catch(reject);
      });
    }

    finder.on('error', (err) => {
      if (options.onError) {
        options.onError(err);
      } else {
        reject(err);
      }
    });

    finder.on('end', () => {
      finderDone = true;
      checkDone();
    });
  });
};
