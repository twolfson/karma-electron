var assert = require('assert');

describe('A karma configuration using an entry file', function () {
  it('invokes the main file', function () {
    var remote = require('electron').remote;
    assert.equal(remote.getGlobal('__ENTRY_TEST_MAIN_FILE_REQUIRED__'), 1);
  });

  it('allows us to do ipc communication', function (done) {
    var ipcRenderer = require('electron').ipcRenderer;
    var REQUEST_CHANNEL = 'INC_NUMBER';
    var RESPONSE_CHANNEL = 'INC_NUMBER_RC';

    ipcRenderer.on(RESPONSE_CHANNEL, function (event, message) {
      assert.equal(message.id, 'some-message');
      assert.equal(message.data.result, 2);

      done();
    });

    ipcRenderer.send(REQUEST_CHANNEL, {
      id: 'some-message',
      data: {
        number: 1
      }
    });
  });
});
