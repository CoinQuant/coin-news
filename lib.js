'use strict';

const _ = require('lodash');

exports.indexOf = (str, keywords) => {
  let index = -1;

  if (!_.isString(str) || !_.isArray(keywords)) {
    return index;
  }

  for (let i = 0; i < keywords.length; i++) {
    if (str.indexOf(keywords[i]) >= 0) {
      index++;
    }
  }

  return index;
};
