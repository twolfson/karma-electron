process.on('uncaughtException', function handleUncaughtException (err) {
  throw err;
});

var app = require('electron').app;

app.on('window-all-closed', function handleWindowsClosed () {
  app.quit();
});

app.on('ready', function handleReady () {
  console.log('Loaded');
  process.nextTick(process.exit);
});
