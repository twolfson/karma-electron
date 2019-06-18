// Load in our dependencies
// DEV: We use `require`/`assert` instead of `peerDependencies` to make floating dependencies easier
var electronPrebuilt;
var tmp = require('tmp');
try {
  electronPrebuilt = require('electron');
} catch (electronNotFoundErr) {
  try {
    electronPrebuilt = require('electron-prebuilt');
    // https://github.com/electron-userland/electron-prebuilt/tree/v1.3.3#installation
    console.warn('WARN: `electron-prebuilt` has been deprecated as of `electron-prebuilt@1.3.1`. ' +
      'Please move to `electron` instead');
  } catch (electronPrebuiltNotFoundErr) {
    console.error('Expected `electron` to be installed but it was not. Please install it.');
    throw electronNotFoundErr;
  }
}

// DEV: This is a trimmed down version of https://github.com/karma-runner/karma-chrome-launcher/blob/v0.2.2/index.js
//   which is MIT licensed https://github.com/karma-runner/karma-chrome-launcher/blob/v0.2.2/LICENSE
var $inject = ['baseBrowserDecorator', 'args', 'config.basePath', 'config.urlRoot'];
function ElectronBrowser(baseBrowserDecorator, args, karmaBasePath, karmaUrlRoot) {
  // Apply browser decorations to ourself
  baseBrowserDecorator(this);

  // Extract arguments
  var flags = args.flags || [];
  var userDataDir = args.userDataDir || this._tempDir;

  // Relocate extended options into temporary file
  // DEV: Electron on Windows doesn't support `stdin` reading
  //   https://github.com/electron/electron/issues/4218
  var extendedOptions;
  if (args.browserWindowOptions) {
    extendedOptions = extendedOptions || {};
    extendedOptions.browserWindowOptions = args.browserWindowOptions;
  }
  if (args.loadURLOptions) {
    extendedOptions = extendedOptions || {};
    extendedOptions.loadURLOptions = args.loadURLOptions;
  }
  if (extendedOptions) {
    // TODO: Output to file in a bit
    //   Should determine if this blocks everything or only Electron
  }

  // Show depreciation warning for `--show`
  if (flags.indexOf('--show') !== -1) {
    console.log('karma-electron: `--show` is now deprecated. Please use `browserWindowOptions.show` instead');
  }

  // Set up app to use a custom user data directory to prevent crossover in tests
  this._getOptions = function (url) {
    var retArr = [__dirname + '/electron-launcher.js'].concat(flags, [
      '--user-data-dir', userDataDir,
      '--url', url
    ]);
    if (args.require) { retArr = retArr.concat(['--require', args.require]); }
    if (extendedOptions) { retArr = retArr.concat(['--extended-options', TODO]); }
    return retArr;
  };
}
ElectronBrowser.prototype = {
  name: 'Electron',
  DEFAULT_CMD: {
    linux: electronPrebuilt,
    darwin: electronPrebuilt,
    win32: electronPrebuilt
  },
  ENV_CMD: 'ELECTRON_BIN'
};

// Define depenencies so our function can receive them
ElectronBrowser.$inject = $inject;

// Export our launcher
module.exports = {
  'launcher:Electron': ['type', ElectronBrowser]
};
