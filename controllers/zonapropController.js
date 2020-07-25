const fs = require('fs');
const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });

// Array to hold the properties
const properties = [];

exports.scraper = function (req, res) {
  // Casa alquiler zona norte, menor precio
  url = `https://www.zonaprop.com.ar/casas-alquiler-gba-norte-orden-precio-ascendente-pagina-${req.params.pageNumber}.html`;

  // Automate page loading
  nightmare
  .goto(url)
  .wait('.list-card-container')
  .evaluate(() => document.body.innerHTML).then((body) => {
    const $ = cheerio.load(body);

    $('.posting-card').filter(function () {
      const url = $(this).attr('data-to-posting').trim();
      const image = $(this).find('img.flickity-lazyloaded') !== undefined ? $(this).find('img.flickity-lazyloaded').attr('src') : $(this).find('img.lazy-loading').attr('data-src');
      const address = $(this).find('.posting-location').text().trim();
      let price = $(this).find('.first-price').text().trim();

      // Trim price based on whether its usd or argentine peso
      if (price.includes('$')) {
        price = price.substring(2).split('.').join('');
      } else if (price.includes('USD')) {
        price = parseInt(price.substring(4).split('.').join('')) * 140;
      }

      const title = $(this).find('.posting-title a').text().trim();
      const description = $(this).find('.posting-description').text().trim();
      const commonInfo = $(this).find('.main-features li').text();
      const ambients = commonInfo.includes('Dormitorio') ? commonInfo.charAt(commonInfo.indexOf('Dormitorio') - 2).trim() : '';
      const toilets = commonInfo.includes('Baño') ? commonInfo.charAt(commonInfo.indexOf('Baño') - 2).trim() : '';
      const area = commonInfo.substring(0, commonInfo.indexOf('m² totales')).trim();

      // Push the properties to the array
      properties.push({
        url: 'http://www.zonaprop.com' + url,
        image: image,
        address: address,
        title: title,
        description: description,
        price: parseInt(price),
        ambients: parseInt(ambients),
        toilets: parseInt(toilets),
        area: parseInt(area),
      });
    });

    fs.writeFile('data/zonaprop.json', JSON.stringify(properties, null, 4), function (err) {
      console.log('File successfully written.');
    })

    res.redirect(`/scrape/zonaprop/${parseInt(req.params.pageNumber) + 1}`);
  });
}