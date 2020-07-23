const express = require('express');
const app = express();

const argenpropController = require('./controllers/argenpropController');
const properatiController = require('./controllers/properatiController');
const mercadolibreController = require('./controllers/mercadolibreController');

app.get('/scrape/argenprop/:pageNumber', argenpropController.scraper);
app.get('/scrape/properati/:pageNumber', properatiController.scraper);
app.get('/scrape/meli/:pageNumber', mercadolibreController.scraper);

app.listen('8081');
exports = module.exports = app;