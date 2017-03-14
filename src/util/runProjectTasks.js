'use strict';

module.exports = (project) => {
  let promise = Promise.resolve();

  project.getTasks().forEach((task) => {
    promise = promise.then(Promise.resolve(task.run(project)));
  });

  return promise;
};
