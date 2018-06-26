var path = require("path");
const express = require("express");
const app = express();

const staticOptions = {
  root: __dirname + '/public/',
  maxAge: 0
};
app.set("view engine", "html");
// disable layout

app.use('/js', express.static('../public/js', staticOptions));
app.use('/css', express.static('../public/css', staticOptions));
app.use('/imgs', express.static('../public/imgs', staticOptions));
app.use('/avatars', express.static('../public/avatars', staticOptions));
app.use('/sw.js', (req, res) => res.sendFile(path.resolve('../public/sw.js'), staticOptions));
app.use('/sw.js.map', (req, res) => res.sendFile(path.resolve('../public/sw.js.map'), staticOptions));

app.get("/", (req, res) => res.sendFile('index.html', staticOptions));

app.listen(3000, () => console.log("Example app listening on port 3000!"));
