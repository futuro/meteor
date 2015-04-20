var util = Npm.require('util');
var Future = Npm.require('fibers/future');
var path = Npm.require('path');
var jshint = Npm.require('jshint').JSHINT;

Plugin.registerLinter({
  extensions: ["jshintrc", "js"],
}, function () {
  var linter = new JsHintLinter();
  return linter;
});

function JsHintLinter () {};

JsHintLinter.prototype.processFilesForTarget = function (files, globals) {
  var conf = {
    undef: true,
    unused: true,
    node: true,
    browser: true
  };

  files.forEach(function (file) {
    // find the config file
    if (file.getBasename() === '.jshintrc') {
      var confStr = file.getContentsAsString();
      try {
        conf = JSON.parse(confStr);
      } catch (err) {
        file.error({ message: "Failed to parse .jshint file, not a valid JSON: " + err.message });
      }
      return;
    }
    // require configuration file to be called '.jshintrc'
    if (path.extname(file.getBasename()) !== '.js') {
      file.error({ message: "Unrecognized configuration file name. Configuration file should be called .jshintrc" });
      return;
    }
  });

  files.forEach(function (file) {
    if (file.getBasename() === '.jshintrc')
      return;
    if (! jshint(file.getContentsAsString(), conf, globals)) {
      jshint.errors.forEach(function (error) {
        file.error({
          message: error.reason,
          line: error.line,
          column: error.character
        });
      });
    }
  });
};


