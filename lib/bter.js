'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JubiNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://bter.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + '/',
        headers: { Cookie: 'lang=cn' },
        callback: async (err, res, done) => {
          if (err || res.statusCode !== 200) {
            this.emit('error', err || res.statusCode);
            return done();
          }

          const $ = res.$;
          const notices = [];
          const rightBox = $('.right-box')[0];

          $(rightBox).find('li').each((i, elem) => {
            const tagA = $(elem).find('a')[0];
            const path = $(tagA).attr('href');
            let last = path.substr(_.lastIndexOf(path, '/') + 1);

            if (parseInt(last) > current) {
              notices.push({
                title: $(tagA).text(),
                time: null,
                url: this._preUrl + path
              });
            }
          });

          this.emit('data', notices);

          done();
        }
      }
    ]);
  }
};
