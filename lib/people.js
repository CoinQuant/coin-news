'use strict';

const EventEmitter = require('events');
const Iconv = require('iconv').Iconv;
const cheerio = require('cheerio');
const rp = require('request-promise');
const parser = require('xml2json');
const _ = require('lodash');
const iconv = new Iconv('GBK', 'UTF-8');

const lib = require('../lib.js');

module.exports = class PeopleNews extends EventEmitter {
  constructor(crawler, keywords) {
    super();
    this._preUrl = 'http://www.people.com.cn';
    this._crawler = crawler;
    this._keywords = keywords;
  }

  async _getTime(url) {
    const result = await rp({ uri: url, encoding: null });
    const $ = cheerio.load(iconv.convert(result));
    const timeText = $($($('.box01')).find('.fl')).text().substr(0, 16);

    return (
      _.replace(_.replace(_.replace(timeText, '年', '-'), '月', '-'), '日', ' ') +
      ':00'
    );
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + `/rss/finance.xml`,
        callback: async (err, res, done) => {
          if (err || res.statusCode !== 200) {
            this.emit('error', err || res.statusCode);
            return done();
          }

          const notices = [];
          const body = parser.toJson(res.body);
          const content = JSON.parse(body);

          for (let i = 0; i < content.rss.channel.item.length; i++) {
            const last = await this._getTime(content.rss.channel.item[i].link);

            if (
              +new Date(last) > current &&
              lib.indexOf(content.rss.channel.item[i].title, this._keywords) >=
                0
            ) {
              notices.push({
                title: '【人民网】' + content.rss.channel.item[i].title,
                time: last,
                url: content.rss.channel.item[i].link
              });
            }
          }

          this.emit('data', notices);

          done();
        }
      }
    ]);
  }
};
