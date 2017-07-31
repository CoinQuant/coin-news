'use strict';

const EventEmitter = require('events');
const url = require('url');
const _ = require('lodash');

module.exports = class BitecoinNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._targetUrl =
      'http://www.bitecoin.com/online/category/%E6%AF%94%E7%89%B9%E5%B8%81';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._targetUrl,
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'zh-CN,zh;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          Cookie: 'PHPSESSID=f4b6mkf3hlobbvpg7d5por8nq6',
          Host: 'www.bitecoin.com',
          'Upgrade-Insecure-Requests': 1,
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36'
        },
        callback: async (err, res, done) => {
          if (err || res.statusCode !== 200) {
            this.emit('error', err || res.statusCode);
            return done();
          }

          const $ = res.$;
          const notices = [];

          $('.newslist').find('.excerpt').each((i, el) => {
            const titleEl = $(el).find('h2').find('a');
            const href = new url.URL(titleEl.attr('href'));
            const last = +_.replace(
              _.last(href.pathname.split('/')),
              '.html',
              ''
            );
            const title = _.trim(_.replace(titleEl.text(), '/r/n', ''));

            notices.push({
              title: title,
              time: null,
              url: href.toString()
            });
          });

          this.emit('data', notices);
          done();
        }
      }
    ]);
  }
};
