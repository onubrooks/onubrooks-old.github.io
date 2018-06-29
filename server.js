var path = require("path");
const express = require("express");
const app = express();

const staticOptions = {
  root: __dirname + '/',
  maxAge: 0
};
//app.set("view engine", "html");
// disable layout

app.use('/dist/js', express.static('dist/js', staticOptions));
app.use('/dist/css', express.static('dist/css', staticOptions));
app.use('/dist/img', express.static('dist/img', staticOptions));
app.get('/sw.js', (req, res) => res.sendFile('sw.js', staticOptions));

app.get("/", (req, res) => res.sendFile('index.html', staticOptions));

app.listen(3000, () => console.log("App listening on port 3000!"));
