// import idb from "idb";

class PageController {
  constructor(inputCurrValNode, inputCurrUnitNode, outputCurrValNode, outputCurrUnitNode, convertButton) {
    // initialise nodes for the page input controls
    this.inputCurrValNode = inputCurrValNode;
    this.inputCurrUnitNode = inputCurrUnitNode;
    this.outputCurrValNode = outputCurrValNode;
    this.outputCurrUnitNode = outputCurrUnitNode;
    this.convertButton = convertButton;
  }

  // this method sets up the event listeners and service worker
  init() {
    // set event listener for convert button
    this.convertButton.addEventListener('click', this.fetchValue.bind(this));

    // register service worker
    this.registerWorker();

    // open indexDB
    this.dbPromise = this.openDb();
  }

  // this method is called when the convert button is pressed, it makes the API call
  // to the free currency converter API and updates the value of the output
  fetchValue() {
    let loader = document.getElementById('loader');
    loader.classList.remove('hide');
    this.convertButton.value = "Converting";
    
    let fromCurrency = encodeURIComponent(this.inputCurrUnitNode.value);
    let toCurrency = encodeURIComponent(this.outputCurrUnitNode.value);
    let query = `${fromCurrency}_${toCurrency}`;

    let request = this.showStoredPair(query).then((val) => {
      if(val) {
        return this.fromDB(val);
      }
      return this.fromAPI(query);
    });
  }

  // this method registers the service worker in the browser
  registerWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (err) => {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
      
    }
  }

  // open idb database
  openDb() {
    if (!'serviceWorker' in navigator) return Promise.resolve();

    return idb.open('curr-conv-db', 1, (upgradeDb) => {
      // call the db table currency_pairs since we will be storing pairs of currencies as keys with their values
      let keyValStore = upgradeDb.createObjectStore('currency_pairs');
    });
  }
// save key value pair to the db
  savePair(query, result) {
    this.dbPromise.then((db) => {
      if(!db) return;
      let tx = db.transaction('currency_pairs', 'readwrite');
      let store = tx.objectStore('currency_pairs');
      store.put(result, query);
      // keep items in the store less than 40
      store.openCursor(null, 'prev').then(function deleteRest(cursor) {
        return cursor.advance(40).then((cursor) => {
          if(!cursor) return;
          cursor.delete();
          return cursor.continue().then(deleteRest);
        });
      });
    });
  }

  // fetch response from the store if available
  showStoredPair(query) {
    return this.dbPromise.then((db) => {
      if (!db) return;
      let tx = db.transaction('currency_pairs');
      let store = tx.objectStore('currency_pairs');
      return store.get(query);
    });
  }

  // this function takes the value retrieved from the indexedDB store and updates the page with it
  fromDB(val) {
    let total = val * this.inputCurrValNode.value;
    let result = Math.round(total * 100) / 100;
    this.outputCurrValNode.value = result;
    loader.classList.add('hide');
    this.convertButton.value = "Convert";
    console.log(`fromDB returns ${val}`);
  }

  // this function is called only if the local indexedDB returns no value
  // it makes the api call, returns the value and stores the result in indexedDB for future use
  fromAPI(query) {
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
          // save pair to indexDB
          this.savePair(query, val);
          console.log(`fromAPI returns ${val}`);
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
