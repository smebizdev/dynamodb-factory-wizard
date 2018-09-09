/* eslint-disable no-underscore-dangle */
const AWS = require('aws-sdk');

const Factory = require('./Factory');

const dfw = {
  _AWS: AWS,
  config(c) {
    this._AWS = c.AWS || this._AWS;
  },
  define(f) {
    return overrides => new Factory(this._AWS, Object.assign({}, f, overrides));
  },
};

module.exports = dfw;
