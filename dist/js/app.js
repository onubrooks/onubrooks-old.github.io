'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This is the source javascript file that controls the page, source is written in ES6
 * I use babel to transpile to ES5 and output it in the dist folder: 
 * babel src --presets es2015 --out-dir dist
 * 
 */

var PageController = function () {
  function PageController(inputCurrValNode, inputCurrUnitNode, outputCurrValNode, outputCurrUnitNode, convertButton) {
    _classCallCheck(this, PageController);

    // initialise nodes for the page input controls
    this.inputCurrValNode = inputCurrValNode;
    this.inputCurrUnitNode = inputCurrUnitNode;
    this.outputCurrValNode = outputCurrValNode;
    this.outputCurrUnitNode = outputCurrUnitNode;
    this.convertButton = convertButton;
  }

  // this method sets up the event listeners and service worker


  _createClass(PageController, [{
    key: 'init',
    value: function init() {
      // set event listener for convert button
      this.convertButton.addEventListener('click', this.fetchValue.bind(this));

      // register service worker
      this.registerWorker();

      // open indexDB
      this.dbPromise = this.openDb();
    }

    // this method is called when the convert button is pressed, it makes the API call
    // to the free currency converter API and updates the value of the output

  }, {
    key: 'fetchValue',
    value: function fetchValue() {
      var _this = this;

      var loader = document.getElementById('loader');
      loader.classList.remove('hide');
      this.convertButton.value = "Converting";

      var fromCurrency = encodeURIComponent(this.inputCurrUnitNode.value);
      var toCurrency = encodeURIComponent(this.outputCurrUnitNode.value);
      var query = fromCurrency + '_' + toCurrency;

      var request = this.showStoredPair(query).then(function (val) {
        if (val) {
          return _this.fromDB(val);
        }
        return _this.fromAPI(query);
      });
    }

    // this method registers the service worker in the browser

  }, {
    key: 'registerWorker',
    value: function registerWorker() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
          // Registration was successful
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
          // registration failed :(
          console.log('ServiceWorker registration failed: ', err);
        });
      }
    }

    // open idb database

  }, {
    key: 'openDb',
    value: function openDb() {
      if (!'serviceWorker' in navigator) return Promise.resolve();

      return idb.open('curr-conv-db', 1, function (upgradeDb) {
        // call the db table currency_pairs since we will be storing pairs of currencies as keys with their values
        var keyValStore = upgradeDb.createObjectStore('currency_pairs');
      });
    }
    // save key value pair to the db

  }, {
    key: 'savePair',
    value: function savePair(query, result) {
      this.dbPromise.then(function (db) {
        if (!db) return;
        var tx = db.transaction('currency_pairs', 'readwrite');
        var store = tx.objectStore('currency_pairs');
        store.put(result, query);
        // keep items in the store less than 40
        store.openCursor(null, 'prev').then(function deleteRest(cursor) {
          return cursor.advance(40).then(function (cursor) {
            if (!cursor) return;
            cursor.delete();
            return cursor.continue().then(deleteRest);
          });
        });
      });
    }

    // fetch response from the store if available

  }, {
    key: 'showStoredPair',
    value: function showStoredPair(query) {
      return this.dbPromise.then(function (db) {
        if (!db) return;
        var tx = db.transaction('currency_pairs');
        var store = tx.objectStore('currency_pairs');
        return store.get(query);
      });
    }

    // this function takes the value retrieved from the indexedDB store and updates the page with it

  }, {
    key: 'fromDB',
    value: function fromDB(val) {
      var total = val * this.inputCurrValNode.value;
      var result = Math.round(total * 100) / 100;
      this.outputCurrValNode.value = result;
      loader.classList.add('hide');
      this.convertButton.value = "Convert";
      console.log('fromDB returns ' + val);
    }

    // this function is called only if the local indexedDB returns no value
    // it makes the api call, returns the value and stores the result in indexedDB for future use

  }, {
    key: 'fromAPI',
    value: function fromAPI(query) {
      var _this2 = this;

      var url = 'https://free.currencyconverterapi.com/api/v5/convert?q=' + query + '&compact=ultra';
      var JSONResponse = fetch(url).then(function (response) {
        return response.json();
      }).then(function (resJson) {
        var val = resJson[query];
        if (val) {
          var total = val * _this2.inputCurrValNode.value;
          var result = Math.round(total * 100) / 100;
          _this2.outputCurrValNode.value = result;
          // save pair to indexDB
          _this2.savePair(query, val);
          console.log('fromAPI returns ' + val);
        } else {
          var err = new Error("Value not found for " + query);
          console.log(err);
          alert(err);
        }
      }).catch(function (err) {
        var error = new Error("Value not found for " + query);
        console.log(err);
        alert(error);
      }).finally(function () {
        loader.classList.add('hide');
        _this2.convertButton.value = "Convert";
      });
    }
  }]);

  return PageController;
}();

// create a new instance of pageController and initialize after document loaded


window.addEventListener("load", function (event) {
  var inputCurrValNode = document.getElementById('input-cur-val');
  var inputCurrUnitNode = document.getElementById("input-cur-unit");
  var outputCurrValNode = document.getElementById("output-cur-val");
  var outputCurrUnitNode = document.getElementById("output-cur-unit");
  var convertButton = document.getElementById("convert-button");

  window.controller = new PageController(inputCurrValNode, inputCurrUnitNode, outputCurrValNode, outputCurrUnitNode, convertButton);
  controller.init();
  console.log("All resources fully loaded and page controller initialized!");
});