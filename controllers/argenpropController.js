const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

// Array to hold the properties
const properties = [];

exports.scraper = function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://www.argenprop.com/casa-alquiler-region-zona-norte-orden-menorprecio-pagina-${req.params.pageNumber}`;

  request(url, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('.listing__item').filter(function () {
        const url = $(this).children().first().attr('href');
        const image = $(this).find('.card__photos li img').attr('data-src');
        let price = $(this).find('.card__monetary-values').text().trim();

        // If it's consultar precio, we set it to 0
        if (price === 'Consultar precio') {
          price = 0;
        } 
        // Trim it based on whether its usd or argentine peso
        else if (price.includes('$')) {
          price = price.substring(2).split('.').join('');
        } else if (price.includes('USD')) {
          price = parseInt(price.substring(4).split('.').join('')) * 140;
        }

        const address = $(this).find('.card__address').text().trim();
        const title = $(this).find('.card__title').text().trim();
        const description = $(this).find('.card__info').text().trim();
        const commonInfo = $(this).find('.card__common-data').text();
        const area = commonInfo.substring(0, commonInfo.indexOf('m²')).trim();
        const ambients = commonInfo.includes('dormitorio') ? commonInfo.charAt(commonInfo.indexOf('dormitorio') - 2).trim() : '';
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
}