var path = require("path");
const express = require("express");
const app = express();

const staticOptions = {
  root: __dirname + '/currency-converter/',
  maxAge: 0
};
//app.set("view engine", "html");
// disable layout

app.use('/js', express.static('currency-converter/dist/js', staticOptions));
app.use('/css', express.static('currency-converter/dist/css', staticOptions));
app.use('/img', express.static('currency-converter/dist/img', staticOptions));
app.get('/sw.js', (req, res) => res.sendFile('sw.js', staticOptions));

app.get("/", (req, res) => res.sendFile('index.html', staticOptions));

app.listen(3000, () => console.log("Example app listening on port 3000!"));
