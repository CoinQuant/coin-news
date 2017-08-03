'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class JinseNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = getBlockchainUrl();
    this._crawler = crawler;
    this._newsIndex = 0;
    this._blockchainIndex = 0;
  }

  async start() {
    this._crawler.queue([
      {
        uri: this._preUrl,
        userAgent: userAgent(),
        callback: async (err, res, done) => {
          if (err) {
            this.emit('error', err);
          }

          try {
            const $ = res.$;
            const news = $('.news').children().children().children();

            const notices = [];

            let maxNewsIndex = this._newsIndex;
            let maxBlockChainIndex = this._blockchainIndex;

            news.each((i, elem) => {
              if (i >= 8) return;
              const aHref = $(elem).children()[0];
              const href = $(aHref).attr('href');
              const index = getUriIndex(href);
              const title = '[金色财经] ' + $(aHref).attr('title');
              if (
                _.includes(href, getNewsBlockchainUrl()) &&
                index > this._newsIndex
              ) {
                notices.push({
                  title,
                  url: href,
                });
                maxNewsIndex = index >= maxNewsIndex ? index : maxNewsIndex;
              } else if (
                _.includes(href, getBlockchainUrl()) &&
                index > this._blockchainIndex
              ) {
                notices.push({
                  title,
                  url: href,
                });
                maxBlockChainIndex =
                  index >= maxBlockChainIndex ? index : maxBlockChainIndex;
              }
            });

            if (notices.length > 0) {
              this.emit('data', notices);
              this._newsIndex = maxNewsIndex;
              this._blockchainIndex = maxBlockChainIndex;
            }
            done();
          } catch (e) {
            done();
          }
        },
      },
    ]);
  }
};

function getUriIndex(uri) {
  const index = uri.substr(_.lastIndexOf(uri, '/') + 1, _.indexOf(uri, '.'));
  return _.parseInt(index);
}

function getPreUrl(uri) {
  return uri.substr(0, _.lastIndexOf(uri, '/'));
}

function getNewsBlockchainUrl() {
  return 'http://www.jinse.com/news/blockchain';
}

function getBlockchainUrl() {
  return 'http://www.jinse.com/blockchain';
}

function userAgent() {
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36';
}
