
class PageController {
  constructor(inputCurrValNode, inputCurrUnitNode, outputCurrValNode, outputCurrUnitNode, convertButton) {
    // initialise nodes for the page input elements
    this.inputCurrValNode = inputCurrValNode; // document.getElementById('input-cur-val');
    this.inputCurrUnitNode = inputCurrUnitNode; // document.getElementById("input-cur-unit");
    this.outputCurrValNode = outputCurrValNode; // document.getElementById("output-cur-val");
    this.outputCurrUnitNode = outputCurrUnitNode; // document.getElementById("output-cur-unit");
    this.convertButton = convertButton; // document.getElementById("convert-button");
  }

  // this method sets up the event listeners and service worker
  init() {
    // set event listener for convert button
    this.convertButton.addEventListener('click', this.fetchValue.bind(this));

    // register service worker
    this.registerWorker();
  }

  // this mathod is called when the convert button is pressed, it makes the API call
  // to the free currency converter API and updates the value of the output
  fetchValue() {
    console.log('button pressed!');
    let loader = document.getElementById('loader');
    loader.classList.remove('hide');
    this.convertButton.value = "Converting";
    
    let fromCurrency = encodeURIComponent(this.inputCurrUnitNode.value);
    let toCurrency = encodeURIComponent(this.outputCurrUnitNode.value);
    let query = `${fromCurrency}_${toCurrency}`;

    let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
    let JSONResponse = fetch(url)
          .then((response) => {
            return response.json();
          })
          .then((resJson) => {
            let val = resJson[query];
            if (val) {
              let total = val * this.inputCurrValNode.value;
              let result = Math.round(total * 100) / 100;
              this.outputCurrValNode.value = result;
            } else {
              let err = new Error("Value not found for " + query);
              console.log(err);
              alert(err);
            }
          }).catch((err) => {
            let error = new Error("Value not found for " + query);
            console.log(err);
            alert(error);
          }).finally(() => {
            loader.classList.add('hide');
            this.convertButton.value = "Convert";
          });
  }

  // this method registers the service worker in the browser
  registerWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          // Registration was successful
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, (err) => {
          // registration failed :(
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }
}

// create a new instance of pageController and initialize after document loaded
window.addEventListener("load", (event) => {
  let inputCurrValNode = document.getElementById('input-cur-val');
  let inputCurrUnitNode = document.getElementById("input-cur-unit");
  let outputCurrValNode = document.getElementById("output-cur-val");
  let outputCurrUnitNode = document.getElementById("output-cur-unit");
  let convertButton = document.getElementById("convert-button");

  window.controller = new PageController(inputCurrValNode, inputCurrUnitNode, outputCurrValNode, outputCurrUnitNode, convertButton);
  controller.init();
  console.log("All resources fully loaded and page controller initialized!");
});
