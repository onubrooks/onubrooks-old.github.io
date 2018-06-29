# ALC-currency-converter
A small website that uses the free currency converter API to convert between currencies of different countries.

The project is a challenge from the Andela Learning Community as part of the selection process for the Google Africa Scholarship.
It uses plain javascript and foundation css library. No other external libraries are used.

As indicated in the website: https://free.currencyconverterapi.com/, the currency converter API is free and licenced under the MIT license

### Setting Up the app
the source files are written in ES2015 and are in the currency-converter/src folder
babel cli is used to convert to ES5 and outputted in the currency-converter/dist folder using the following commands:
yarn global add babel-cli
yarn add --dev babel-core babel-preset-es2015
babel /src --presets es2015 --out-dir /dist

### Using the app


## Troubleshooting

* Errors while executing the app:
  * The first thing to try is to upgrade to latest version of node.
  * Reload the page by doing a hard refresh using CTRL + SHIFT + RELOAD

