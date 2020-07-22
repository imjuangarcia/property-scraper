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
        const commonInfo = $(this).find('.card__common-data').text().trim();

        // Push the properties to the array
        properties.push({
          url: url,
          image: image,
          price: price,
          address: address,
          title: title,
          description: description,
          commonInfo: commonInfo,
        });
      });
    }

    fs.appendFile('argenprop.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    })

    res.send('Check your console')
  });
});

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;