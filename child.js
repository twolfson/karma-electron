process.on('uncaughtException', function handleUncaughtException (err) {
  throw err;
});

var app = require('electron').app;
var BrowserWindow = require('electron').BrowserWindow;

app.on('window-all-closed', function handleWindowsClosed () {
  app.quit();
});

app.setPath('userData', __dirname + '/tmp');

      // fs.readFile(program.extendedOptions, 'utf8', function handleReadFile (err, extendedOptionsStr) {


app.on('ready', function handleReady () {
  var browserWindow = new BrowserWindow();
  browserWindow.loadURL('https://google.com/');

  console.log('Loaded');

  setTimeout(process.exit, 3000);
});
