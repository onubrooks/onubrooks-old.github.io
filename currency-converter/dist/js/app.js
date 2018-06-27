'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PageController = function () {
  function PageController(inputCurrValNode, inputCurrUnitNode, outputCurrValNode, outputCurrUnitNode, convertButton) {
    _classCallCheck(this, PageController);

    // initialise nodes for the page input elements
    this.inputCurrValNode = inputCurrValNode; // document.getElementById('input-cur-val');
    this.inputCurrUnitNode = inputCurrUnitNode; // document.getElementById("input-cur-unit");
    this.outputCurrValNode = outputCurrValNode; // document.getElementById("output-cur-val");
    this.outputCurrUnitNode = outputCurrUnitNode; // document.getElementById("output-cur-unit");
    this.convertButton = convertButton; // document.getElementById("convert-button");
  }

  // this method sets up the event listeners and service worker


  _createClass(PageController, [{
    key: 'init',
    value: function init() {
      // set event listener for convert button
      this.convertButton.addEventListener('click', this.fetchValue.bind(this));

      // register service worker
      this.registerWorker();
    }

    // this mathod is called when the convert button is pressed, it makes the API call
    // to the free currency converter API and updates the value of the output

  }, {
    key: 'fetchValue',
    value: function fetchValue() {
      var _this = this;

      console.log('button pressed!');
      var loader = document.getElementById('loader');
      loader.classList.remove('hide');
      this.convertButton.value = "Converting";

      var fromCurrency = encodeURIComponent(this.inputCurrUnitNode.value);
      var toCurrency = encodeURIComponent(this.outputCurrUnitNode.value);
      var query = fromCurrency + '_' + toCurrency;

      var url = 'https://free.currencyconverterapi.com/api/v5/convert?q=' + query + '&compact=ultra';
      var JSONResponse = fetch(url).then(function (response) {
        return response.json();
      }).then(function (resJson) {
        var val = resJson[query];
        if (val) {
          var total = val * _this.inputCurrValNode.value;
          var result = Math.round(total * 100) / 100;
          _this.outputCurrValNode.value = result;
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
        _this.convertButton.value = "Convert";
      });
    }

    // this method registers the service worker in the browser

  }, {
    key: 'registerWorker',
    value: function registerWorker() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      }
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
  console.log("All resources finished loading and page controller initialized!");
});