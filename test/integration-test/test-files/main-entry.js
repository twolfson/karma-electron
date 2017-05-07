var ipcMain = require('electron').ipcMain;

global.__ENTRY_TEST_MAIN_FILE_REQUIRED__ = 1;

ipcMain.on('INC_NUMBER', function (event, message) {
  event.sender.send('INC_NUMBER_RC', {
    id: message.id,
    data: {
      result: message.data.number + 1
    }
  });
});
