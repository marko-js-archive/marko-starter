module.exports = require('./Model').extend({
  wrap: false,
  clean: function (value) {
    return value;
  }
});
