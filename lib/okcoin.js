'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JubiNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://www.okcoin.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + '/service.html',
        headers: { Cookie: 'language=0' },
        callback: async (err, res, done) => {
          if (err || res.statusCode !== 200) {
            this.emit('error', err || res.statusCode);
            return done();
          }

          const $ = res.$;
          const notices = [];
          let maxIndex = current;

          $('.newsList li').each((i, elem) => {
            const path = $($($(elem).children()[0]).children()[1]).attr('href');
            let last = path.substr(
              _.lastIndexOf(path, '-') + 1,
              _.indexOf(path, '.')
            );

            if (parseInt(last) > current) {
              maxIndex = parseInt(last);
              notices.push({
                title:
                  '【OKCoin】' + $($($(elem).children()[0]).children()[1]).text(),
                time: $($(elem).children()[1]).text(),
                url: path
              });
            }
          });

          this.emit('data', {
            data: notices,
            current: maxIndex
          });

          done();
        }
      }
    ]);
  }
};
