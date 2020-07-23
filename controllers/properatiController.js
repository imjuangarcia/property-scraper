const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

// Array to hold the properties
const properties = [];

exports.scraper = function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://www.properati.com.ar/casa/alquiler/ord:p-a_en:escobar,maschwitz,bs-as-g-b-a-zona-norte/${req.params.pageNumber}/`;

  request(url, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('article.item').filter(function () {
        const url = $(this).find('.picture a').attr('href');
        const image = $(this).find('.picture .carousel img').attr('src');
        let price = $(this).find('.price').children().remove().end().text().trim();

        // Trim it based on whether its usd or argentine peso
        if (price.includes('U$S')) {
          price = price.substring(4).split('.').join('')
        } else {
          price = price.substring(2).split('.').join('')
        }

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

        console.log(properties);
      });
    }

    fs.writeFile('data/properati.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    });

    res.redirect(`/scrape/properati/${parseInt(req.params.pageNumber) + 1}`);
  });
  
}