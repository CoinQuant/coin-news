'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JubiNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://www.jubi.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + '/gonggao/',
        callback: async (err, res, done) => {
          if (err || res.statusCode !== 200) {
            this.emit('error', err || res.statusCode);
            return done();
          }

          const $ = res.$;
          const notices = [];
          let maxIndex = current;

          $('.new_list li').each((i, elem) => {
            const path = $($($($($(elem).children())[2]).children())[0]).attr(
              'href'
            );
            let last = path.substr(
              _.lastIndexOf(path, '/') + 1,
              _.indexOf(path, '.')
            );

            if (parseInt(last) > current) {
              maxIndex = parseInt(last);
              notices.push({
                title: '[聚币] ' + $($($(elem).children())[0]).text(),
                time: $($($(elem).children())[1]).text(),
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
