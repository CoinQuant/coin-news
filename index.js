'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

module.exports = class News extends EventEmitter {
  constructor(crawler) {
    super();
    this._crawler = crawler;
  }

  get current() {
    return {
      jubi: 2764,
      huobi: 633,
      okcoin: 468,
      szzc: 1502772762000,
      yunbi: 1502541710000,
      bter: 16234,
      people: 1501469700000,
      jinse: 0,
      bitecoin: 25274
    };
  }

  get keywords() {
    return ['比特币'];
  }

  set current(value) {
    this.current[value.platform] = value.value;
  }

  async start() {
    const pfs = _.keys(this.current);

    for (let i = 0; i < pfs.length; i++) {
      const platform_ = pfs[i];
      const NN = require(`./lib/${platform_}.js`);
      const newsAndNotice = new NN(this._crawler, this.keywords);

      try {
        await newsAndNotice.start(this.current[platform_]);
        newsAndNotice.on('data', async data => {
          if (_.has(data, 'current')) {
            this.current[platform_] = data.current;
            this.emit('data', data.data);
            return;
          } else {
            this.emit('data', data);
          }
        });

        newsAndNotice.on('error', async err => {
          console.log(err);
        });
      } catch (e) {}
    }
  }
};
