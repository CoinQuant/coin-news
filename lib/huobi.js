'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JubiNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://www.huobi.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + '/p/content/notice',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        callback: async (err, res, done) => {
          if (err || res.statusCode !== 200) {
            this.emit('error', err || res.statusCode);
            return done();
          }

          const $ = res.$;
          const notices = [];
          let maxIndex = current;

          $('.notice li').each((i, elem) => {
            const path = $($($($($(elem).children())[0]).children())[2]).attr(
              'href'
            );
            let last = path.substr(_.lastIndexOf(path, '=') + 1);

            if (parseInt(last) > current) {
              maxIndex = parseInt(last);
              notices.push({
                title:
                  '【火币】' +
                  $($($($($(elem).children())[0]).children())[2]).text(),
                time: $($($(elem).children())[2]).text(),
                url: this._preUrl + path
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
