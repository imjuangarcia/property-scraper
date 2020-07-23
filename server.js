const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

// Array to hold the properties
const properties = [];

app.get('/scrape/argenprop/:pageNumber', function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://www.argenprop.com/casa-alquiler-region-zona-norte-orden-menorprecio-pagina-${req.params.pageNumber}`;

  request(url, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('.listing__item').filter(function() {
        const url = $(this).children().first().attr('href');
        const image = $(this).find('.card__photos li img').attr('data-src');
        let price = $(this).find('.card__monetary-values').text().trim();

        // If it's consultar precio, we set it to 0
        if(price === 'Consultar precio') {
          price = 0;
        } else {
          // If it's a value, we remove the $ and .
          price = price.substring(2).split('.').join('');
        }

        const address = $(this).find('.card__address').text().trim();
        const title = $(this).find('.card__title').text().trim();
        const description = $(this).find('.card__card__info').text().trim();
        const commonInfo = $(this).find('.card__common-data').text();
        const area = commonInfo.substring(0, commonInfo.indexOf('m²')).trim();
        const ambients = commonInfo.includes('dormitorio') ? commonInfo.charAt(commonInfo.indexOf('dormitorio') -2).trim() : '';
        const toilets = commonInfo.includes('baño') ? commonInfo.charAt(commonInfo.indexOf('baño') - 2).trim() : '';

        // Push the properties to the array
        properties.push({
          url: url,
          image: image,
          price: parseInt(price),
          address: address,
          title: title,
          description: description,
          commonInfo: commonInfo,
          area: parseInt(area),
          ambients: parseInt(ambients),
          toilets: parseInt(toilets),
        });
      });
    }

    fs.writeFile('data/argenprop.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    })

    res.redirect(`/scrape/argenprop/${parseInt(req.params.pageNumber) + 1}`);
  });
});

app.get('/scrape/properati/:pageNumber', function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://www.properati.com.ar/casa/alquiler/ord:p-a_en:escobar,maschwitz,bs-as-g-b-a-zona-norte/${req.params.pageNumber}/`;

  request(url, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('article.item').filter(function() {
        const url = $(this).find('.picture a').attr('href');
        const image = $(this).find('.picture .carousel img').attr('src');
        const price = $(this).find('.price').children().remove().end().text().trim().substring(2).split('.').join('');
        const address = $(this).find('.address').text().trim();
        const location = $(this).find('.location').text().trim();
        const title = $(this).find('.picture .carousel img').attr('alt');
        const description = $(this).find('.picture .carousel img').attr('alt');
        const timestamp = $(this).find('.date-added').text().trim();
        const commonInfo = $(this).find('.rooms').text();
        const ambients = commonInfo.includes('ambiente') ? commonInfo.charAt(commonInfo.indexOf('ambiente') - 2).trim() : '';
        const area = $(this).find('.area').text().replace('m²', '').trim();

        // Push the properties to the array
        properties.push({
          url: url,
          image: image,
          price: parseInt(price),
          address: address,
          title: title,
          location: location,
          description: description,
          timestamp: timestamp,
          ambients: parseInt(ambients),
          area: parseInt(area),
        });
      });
    }

    fs.writeFile('data/properati.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    })

    res.redirect(`/scrape/properati/${parseInt(req.params.pageNumber) + 1}`);
  });
});

app.get('/scrape/meli/:pageNumber', function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://inmuebles.mercadolibre.com.ar/casas/alquiler/bsas-gba-norte/_Desde_${req.params.pageNumber + 48}_OrderId_PRICE`;

  request(url, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('.results-item').filter(function() {
        const url = $(this).find('.images-viewer').attr('item-url');
        const image = $(this).find('.item__image img').attr('src') || $(this).find('.loading').attr('data-src');
        const title = $(this).find('.item__image img').attr('alt') || $(this).find('.loading').attr('alt');
        const price = $(this).find('.price__fraction').text();
        const address = $(this).find('.item_subtitle span').text().trim();
        const location = $(this).find('.item__title').text().trim();
        const commonInfo = $(this).find('.item__attrs').text();
        const ambients = commonInfo.charAt(commonInfo.indexOf('|') + 2);
        const area = commonInfo.substring(0, commonInfo.indexOf('m²'));

        // Push the properties to the array
        properties.push({
          url: url,
          image: image,
          price: parseInt(price),
          address: address,
          title: title,
          location: location,
          description: title,
          ambients: parseInt(ambients),
          area: parseInt(area),
        });
      });
    }

    fs.writeFile('data/meli.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    })

    res.send('Check your console');
  });
});

app.listen('8081');
exports = module.exports = app;