'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class SzzcNews extends EventEmitter {
  constructor(crawler) {
    super();
    this._preUrl = 'https://szzc.com';
    this._crawler = crawler;
  }

  async start(current) {
    this._crawler.queue([
      {
        uri: this._preUrl + '/api/news/articles/NOTICE?language=zh',
        callback: async (err, res, done) => {
          if (err || res.statusCode !== 200) {
            this.emit('error', err || res.statusCode);
            return done();
          }

          const notices = [];
          const body = JSON.parse(res.body);
          let maxIndex = current;

          if (_.get(body, 'status.success')) {
            const data = _.get(body, 'result.data');

            for (let i = 0; i < data.length; i++) {
              if (+new Date(data[i].publication_date) > current) {
                maxIndex = +new Date(data[i].publication_date);
                notices.push({
                  title: '[海枫藤] ' + data[i].subject,
                  time: data[i].publication_date,
                  url: this._preUrl + '/#!/news/' + data[i].id
                });
              }
            }
          }

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
