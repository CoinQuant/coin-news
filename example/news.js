'use strict';

const Crawler = require('crawler');
const News = require('../');
const news = new News(
  new Crawler({
    maxConnection: 10,
    rateLimit: 1500
  })
);

news.on('data', data => {
  console.log(data);
});

async function start() {
  await news.start();
}

start();
