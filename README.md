# electron-search-text
electron findInPage wrapper module

## usage

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>electron-search-text</title>
  <style>
    .electronSearchText-box {
      display: none;
    }
    .electronSearchText-visible {
      display: block;
    }
  </style>
</head>
<body>
<div class="electronSearchText-box">
  <input type="text" class="electronSearchText-input">
  <span class="electronSearchText-count"></span>
</div>
<webview src="./webview.html" preload="./webview.js" id="preview"></webview>
<script>
  const {ipcRenderer} = require('electron');
  const $preview = document.querySelector('#preview');

  const ElectronSearchText = require('./electron-search-text');
  const searcher = new ElectronSearchText({
    target: '#preview'
  });

  ipcRenderer.on('toggleSearch', function() {
    searcher.emit('toggle');
  });
</script>
</body>
</html>
```

options

```js
const searcher = new ElectronSearchText({
  target: 'webview', // selector for search target
  delay: 150, // delay call search function
  visibleClass: '.electronSearchText-visible', // for toggle search box
  input: '.electronSearchText-input', // selector for search input
  count: '.electronSearchText-count', // selector for search results count
  box: '.electronSearchText-box', // selector for search box
});
```
