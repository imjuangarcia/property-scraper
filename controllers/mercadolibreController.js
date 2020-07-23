const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

// Array to hold the properties
const properties = [];

exports.scraper = function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://inmuebles.mercadolibre.com.ar/casas/alquiler/bsas-gba-norte/_Desde_${req.params.pageNumber * 48}_OrderId_PRICE`;

  request(url, function (error, response, html) {
    if (!error) {
      const $ = cheerio.load(html);

      // To get the info on the page
      $('.results-item').filter(function () {
        const url = $(this).find('.images-viewer').attr('item-url');
        const image = $(this).find('.item__image img').attr('src') || $(this).find('.loading').attr('data-src');
        const title = $(this).find('.item__image img').attr('alt') || $(this).find('.loading').attr('alt');
        const price = $(this).find('.price__fraction').text().split('.').join('');
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

    res.redirect(`/scrape/meli/${parseInt(req.params.pageNumber) + 1}`);
  });
}