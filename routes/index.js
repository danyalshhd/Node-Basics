var express = require('express');
var test1Controller = require('../controllers/test-1.js');
var test2Controller = require('../controllers/test-2.js');
var test3Controller = require('../controllers/test-3.js');
var bonusController = require('../controllers/bonus.js');
var app = express();

app.get("/test-1/I/want/title/", test1Controller.getTitles);
app.get("/test-2/I/want/title/", test2Controller.getTitles);
app.get("/test-3/I/want/title/", test3Controller.getTitles);
app.get("/bonus/I/want/title/", bonusController.getTitles);

app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);