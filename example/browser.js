const {ipcRenderer} = require('electron');
const ElectronSearchText = require('electron-search-text');

const searcher = new ElectronSearchText({
  target: 'webview'
});

ipcRenderer.on('toggleSearch', function() {
  searcher.emit('toggle');
});
