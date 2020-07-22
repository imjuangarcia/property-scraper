const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

app.get('/scrape/argenprop/:pageNumber', function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://www.argenprop.com/casa-alquiler-region-zona-norte-orden-menorprecio-pagina-${req.params.pageNumber}`;

  request(url, function (error, response, html) {
    // Array to hold the properties
    const properties = [];
    
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('.listing__item').filter(function() {
        const url = $(this).children().first().attr('href');
        const image = $(this).find('.card__photos li img').attr('data-src');
        const price = $(this).find('.card__monetary-values').text().trim();
        const address = $(this).find('.card__address').text().trim();
        const title = $(this).find('.card__title').text().trim();
        const description = $(this).find('.card__card__info').text().trim();
        const commonInfo = $(this).find('.card__common-data').text();
        const area = commonInfo.substring(0, commonInfo.indexOf('m²'));
        const ambients = commonInfo.includes('dormitorio') ? commonInfo.charAt(commonInfo.indexOf('dormitorio') -2).trim() : '';
        const toilets = commonInfo.includes('baño') ? commonInfo.charAt(commonInfo.indexOf('baño') - 2).trim() : '';

        // Push the properties to the array
        properties.push({
          url: url,
          image: image,
          price: price,
          address: address,
          title: title,
          description: description,
          commonInfo: commonInfo,
          area: area,
          ambients: ambients,
          toilets: toilets,
        });
      });
    }

    fs.appendFile('argenprop.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    })

    res.send('Check your console');
  });
});

app.get('/scrape/properati/:pageNumber', function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://www.properati.com.ar/casa/alquiler/ord:p-a_en:escobar,maschwitz,bs-as-g-b-a-zona-norte/${req.params.pageNumber}/`;

  request(url, function (error, response, html) {
    // Array to hold the properties
    const properties = [];
    
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('article.item').filter(function() {
        const url = $(this).find('.picture a').attr('href');
        const image = $(this).find('.picture .carousel img').attr('src');
        const price = $(this).find('.price').children().remove().end().text().trim();
        const expenses = $(this).find('.price span').text().trim();
        const address = $(this).find('.address').text().trim();
        const location = $(this).find('.location').text().trim();
        const title = $(this).find('.picture .carousel img').attr('alt');
        const description = $(this).find('.picture .carousel img').attr('alt');
        const timestamp = $(this).find('.date-added').text().trim();
        const rooms = $(this).find('.rooms').children().remove().end().text().trim();
        const area = $(this).find('.area').text().trim();

        console.log(area);

        // Push the properties to the array
        properties.push({
          url: url,
          image: image,
          price: price,
          expenses: expenses,
          address: address,
          title: title,
          location: location,
          description: description,
          timestamp: timestamp,
          rooms: rooms,
          area: area,
        });
      });
    }

    fs.appendFile('properati.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    })

    res.send('Check your console');
  });
});

app.listen('8081')
console.log('http://localhost:8081/');
exports = module.exports = app;