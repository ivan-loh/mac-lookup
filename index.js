'use strict';

const fs        = require('fs');
const path      = require('path');
const csvParser = require('@fast-csv/parse');
const defaults  = { csv: __dirname + '/oui.csv', };


const MacLookup = function(config) {

  if (!config) { config = {} }

  this.rebuilding  = false;
  this.db          = {};
  this.options     = {};
  this.options.csv = config.csv || defaults.csv

};

MacLookup.prototype.load = function(done) {
  fs
      .createReadStream(path.resolve(this.options.csv))
      .pipe(csvParser.parse({headers: true}))
      .on('data', row => { this.db[row.Assignment] = row['Organization Name']; })
      .on('end', ()   => { done(); });
}

MacLookup.prototype.rebuild = function(next) {

  if (this.rebuilding) {
    return next(new Error('maclookup db is already being rebuild'));
  }

  this.rebuilding = true;

  // TODO: rebuild function

  this.rebuilding = false;
};

MacLookup.prototype.lookup = function(oui, next) {

  if (!oui || oui.length < 6) {
    return next(new Error('Invalid Request'), null);
  }

  const _oui = oui.split(/[-.:]/).join('').toUpperCase().substring(0, 6);
  if (_oui.length !== 6) {
    return next(new Error('invalid OUI'));
  }

  return next ? next(null, this.db[_oui]) : this.db[_oui];
};

MacLookup.prototype.each = function(each, next) {

  for (let oui in this.db) {
    each(null, {oui, name: this.db[oui]})
  }

  next();
};

module.exports = new MacLookup();
