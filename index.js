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
      jubi: 2733,
      huobi: 623,
      okcoin: 436,
      szzc: 1493636805000,
      yunbi: 1500946964000,
      bter: 16224,
      people: 1501469700000
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
          this.emit('data', data);
        });

        newsAndNotice.on('error', async err => {
          console.log(err);
        });
      } catch (e) {}
    }
  }
};
