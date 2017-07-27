# Coin-News
Collect notice and news from exchanges(yunbi&jubi&okcoin&huobi&bter&szzc)

# Install
npm i git+https://github.com/SuperDBJ/coin-news.git -S

# Useage
```js
const Crawler = require('crawler');
const News = require('coin-news');
const news = new News(
  new Crawler({
    maxConnection: 10,
    rateLimit: 1500
  })
);

news.on('data', data => {
  console.log(data);
});

async function start() {
  await news.start();
}

start();
```