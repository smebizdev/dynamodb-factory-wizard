/* eslint-disable no-underscore-dangle */
const { messages, warning } = require('./utils');

class Factory {
  constructor(AWS, f) {
    this._dc = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

    if (!f.NAME) warning(messages.noNameAttribute);
    this._NAME = f.NAME || 'unnamed';

    if (!f.TABLE) throw new Error(`"${this._NAME}" factory has no TABLE attribute`);
    else this._TABLE = f.TABLE;

    this.attributes = f;

    this.attributes = Object.keys(this.attributes).reduce((accum, i) => {
      const val = this.attributes[i];
      accum[i] = typeof val === 'function' ? val() : val; // eslint-disable-line no-param-reassign
      return accum;
    }, {});

    if (!f.KEY) throw new Error(`"${this._NAME}" factory has no KEY attribute`);
    else {
      this._KEY = f.KEY.reduce((accum, i) => {
        accum[i] = this.attributes[i]; // eslint-disable-line no-param-reassign
        return accum;
      }, {});
    }

    this._READ_ONLY_ATTRIBUTES = f.READ_ONLY_ATTRIBUTES || [];

    delete this.attributes.NAME;
    delete this.attributes.TABLE;
    delete this.attributes.KEY;
    delete this.attributes.READ_ONLY_ATTRIBUTES;
  }

  get writableAttributes() {
    const filtered = Object.keys(this.attributes)
      .filter(key => !this._READ_ONLY_ATTRIBUTES.includes(key))
      .reduce((obj, key) => {
        obj[key] = this.attributes[key]; // eslint-disable-line no-param-reassign
        return obj;
      }, {});
    return filtered;
  }

  async getAttributesFromDatabase() {
    const r = await this._dc.get({ TableName: this._TABLE, Key: this._KEY }).promise();
    if (!r.Item) throw new Error(messages.attributesFromDatabaseOnUnexisting);
    return r.Item;
  }

  async save() {
    await this._dc.put({ TableName: this._TABLE, Item: this.attributes }).promise();
    return this; // so we can do `const variable = new Factory().save();`
  }

  async checkExistence() {
    const r = await this._dc.get({ TableName: this._TABLE, Key: this._KEY }).promise();
    return Boolean(r.Item);
  }

  async checkChanged() {
    const r = await this._dc.get({ TableName: this._TABLE, Key: this._KEY }).promise();
    if (!r.Item) throw new Error(messages.checkChangedOnUnexisting);
    return r.Item === this.attributes;
  }

  delete() {
    return this._dc.delete({ TableName: this._TABLE, Key: this._KEY }).promise();
  }
}

module.exports = Factory;
