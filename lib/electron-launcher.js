// When we run into an uncaught exception, fail hard
// DEV: Without this line, Karma can hang indefinitely
process.on('uncaughtException', function handleUncaughtException (err) {
  throw err;
});

// Load in our dependencies
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var app = require('electron').app;
var async = require('async');
var BrowserWindow = require('electron').BrowserWindow;
var program = require('commander');

// Set up our CLI parser
program.name = 'electron-launcher';
program.option('--user-data-dir [dir]', 'Directory to store user data');
program.option('--show', 'Boolean to make the window visible');
program.option('--extended-options [filepath]', 'Load extended options from file');
program.option('--default-user-agent', 'Boolean when spefified uses default user agent');
// DEV: We need to encode our URL to avoid issues with Electron on Windows
//   https://ci.appveyor.com/project/twolfson/karma-electron-launcher/builds/25358540/job/k8q6ugas6ha0s7n5
program.option('--encoded-url [url]', 'URL to load page at');
program.option('--require [filepath]', 'Path to main process file to require');
program.allowUnknownOption();

// Parse and assert our arguments
program.parse(process.argv);
assert(program.userDataDir, 'Expected `--user-data-dir` to be provided but it was not.');
assert(program.encodedUrl, 'Expected `--encoded-url` to be provided but it was not.');

// When all windows are closed, exit out
app.on('window-all-closed', function handleWindowsClosed () {
  app.quit();
});

// Update `userData` before Electron loads
// DEV: This prevents cookies/localStorage from contaminating across apps
app.setPath('userData', program.userDataDir);

// If we have another file to require, then load it
// DEV: We use `path.resolve` to resolve relative paths from working directory
//   Otherwise, a `require('./foo')` would load relative to this file
if (program.require) {
  require(path.resolve(program.require));
}

// In parallel
async.parallel([
  function loadExtendedOptions (cb) {
    // If we have extended options, then load them in
    if (program.extendedOptions) {
      fs.readFile(program.extendedOptions, 'utf8', function handleReadFile (err, extendedOptionsStr) {
        // If we have an error, callback with it
        if (err) { return cb(err); }

        // Otherwise, load in our options
        var extendedOptions;
        try {
          extendedOptions = JSON.parse(extendedOptionsStr);
        } catch (err) {
          console.error('Error loading extended options: ' + extendedOptionsStr);
          return cb(err);
        }
        Object.assign(program, extendedOptions);
        cb(null);
      });
    // Otherwise, callback in an async behavior (to match `if` case)
    } else {
      process.nextTick(cb);
    }
  },
  function waitForAppReady (cb) {
    app.on('ready', function handleReady (evt) {
      cb(null);
    });
  }
], function handleParallelLoad (err) {
  // If we received an error, throw it
  if (err) { throw err; }

  // Create our browser window
  var browserWindowOptions = Object.assign({
    show: false
  }, program.browserWindowOptions);
  if (program.show !== undefined) {
    browserWindowOptions.show = !!program.show;
  }
  var browserWindow = new BrowserWindow(browserWindowOptions);

  var loadURLOptions = Object.assign({}, program.loadURLOptions);
  if (program.defaultUserAgent !== true) {
    // Set a custom User-Agent for better logging
    // https://github.com/atom/electron/blob/v0.36.9/docs/api/browser-window.md#winloadurlurl-options
    // https://github.com/atom/electron/blob/v0.36.9/docs/api/web-contents.md#webcontentsloadurlurl-options
    // DEV: Default would be "Chrome 47.0.2526 (Linux 0.0.0)"
    //   https://github.com/karma-runner/karma/blob/v0.13.21/lib/browser.js#L25
    //   https://github.com/karma-runner/karma/blob/v0.13.21/lib/helper.js#L7-L11
    // Example: Electron 0.36.9 (Node.js 5.1.1)
    loadURLOptions.userAgent = 'Electron ' + process.versions.electron + ' (Node ' + process.versions.node + ')';
  }
  browserWindow.loadURL(decodeURIComponent(program.encodedUrl), loadURLOptions);
});
