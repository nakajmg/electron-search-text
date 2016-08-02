const _ = require('lodash');
const util = require('util');
const {EventEmitter2} = require('eventemitter2');

const DEFAULT_OPTIONS = {
  target: 'webview',
  delay: 150,
  visibleClass: '.electronSearchText-visible',
  input: '.electronSearchText-input',
  count: '.electronSearchText-count',
  box: '.electronSearchText-box',
};

const ElectronSearchText = (function() {
  const ElectronSearchText = function (options) {
    options = _.assign(DEFAULT_OPTIONS, options);
    EventEmitter2.call(this, options);

    this.$target = document.querySelector(options.target);
    this.$searchCount = document.querySelector(options.count);
    this.$searchInput = document.querySelector(options.input);
    this.$searchBox = document.querySelector(options.box);
    this.visibleClass = options.visibleClass;
    this.delay = options.delay;
    this.current = 0;
    this.prevText = '';

    this.findInPage = _.debounce(this._findInPage, options.delay);
    this._eventify();
  };

  util.inherits(ElectronSearchText, EventEmitter2);

  _.assign(ElectronSearchText.prototype, {
    _eventify() {
      this.$target.addEventListener('found-in-page', this._onFoundInPage.bind(this));
      this.$searchInput.addEventListener('keydown', this._onKeydown.bind(this));
      this.$searchInput.addEventListener('keyup', this._onKeyup.bind(this));
      this.on('toggle', this.toggleSearch.bind(this));
    },

    /*
     * call findInPage
     * */
    _findInPage(text, forward) {
      let findNext = false;
      // stop search when text is empty
      if (text === '') {
        this.prevText = '';
        this.stopFindInPage();
        return;
      }

      // find next match when text is same as prevText
      if (text === this.prevText) {
        findNext = true;
      }

      // find head of matches when text is not same as prevText
      else {
        this.prevText = text;
      }

      this.$target.findInPage(text, {findNext, forward});
    },

    /*
     * call stopFindInPage
     * */
    stopFindInPage() {
      this.$target.stopFindInPage('clearSelection');
      this._resetCount();
    },

    /*
     * toggle visible/invisible to box
     * */
    toggleSearch() {
      const visibleClass = this.visibleClass.substring(1);
      const isVisible = this.$searchBox.classList.contains(visibleClass);
      if (isVisible) {
        this.$searchBox.classList.remove(visibleClass);
        this.$searchInput.blur();
        this.stopFindInPage();
      }
      else {
        this.$searchBox.classList.add(visibleClass);
        this.$searchInput.focus();
      }
    },

    /*
     * set matches count
     * */
    _setCount(count) {
      this.$searchCount.textContent = count;
    },

    /*
     * reset matches count
     * */
    _resetCount() {
      this._setCount('');
    },

    /*
     * display matches count
     * */
    _onFoundInPage({result}) {
      const {activeMatchOrdinal, finalUpdate, matches} = result;

      // keep match position
      if (activeMatchOrdinal) {
        this.current = activeMatchOrdinal;
      }

      // when search finished
      if (finalUpdate) {
        // reset match count when no matches
        if (matches === 0) {
          this.current = 0;
        }
        // display matches count
        this._setCount(`${this.current}/${matches}`);
      }
    },

    _onKeydown(e) {
      // find previous when Shift pressed
      var forward = !e.shiftKey;
      var isMeta = e.metaKey;
      var text = this.$searchInput.value;

      switch(e.code) {
        case 'Enter':
          this.findInPage(text, forward);
          break;

        // exit search also disable search box
        case 'Escape':
          this.stopFindInPage();
          this.toggleSearch();
          break;

        // cmd+g : find forward
        // cmd+shift+g : find previous
        case 'KeyG':
          if (isMeta = true) {
            this.findInPage(text, forward);
          }
          break;
      }
    },

    _onKeyup(e) {
      var text = this.$searchInput.value;
      var {keyCode} = e;

      // keyCode === [0-9] or [a-z]
      var isNumOrChar = (keyCode <= 90 && keyCode >= 65) || (keyCode <= 57 && keyCode >= 48);

      if (isNumOrChar) {
        this.findInPage(text, true);
      }

      // apply without delay
      if (e.code === 'Backspace') {
        this._findInPage(text, true);
      }
    }

  });

  return ElectronSearchText;
})();

module.exports = ElectronSearchText;
