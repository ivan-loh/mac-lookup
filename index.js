'use strict';


var fs         = require('fs');
var request    = require('request');
var sqlite3    = require('sqlite3').verbose();
var lineReader = require('line-reader');


/**
 * Some consts
 */
var rebuilding = false;
var options = {
  url: 'http://standards-oui.ieee.org/oui.txt',
  sql: __dirname + '/oui.db',
  txt: __dirname + '/oui.txt'
};

options.db = new sqlite3.Database(options.sql);


function parse(next) {

  var process = function(db) {

    lineReader.eachLine(options.txt, function(line, last) {

      line = line.trimLeft().trimRight();
      if (line.length < 15) { return; }


      // Get OUI
      var oui = line.substr(0,8).split('-').join('');
      if ( (oui) && (oui.length !== 6) ) { return; }


      // Get Name
      var name;
      line = line.substr(9).trimLeft();
      if (line.substr(0,5) === '(hex)') { name = line.substr(6).trimLeft(); }
      if (name === undefined)           { return; }
      if (name.length < 1)              { return; }


      var stmt = 'INSERT INTO oui(oui, name) VALUES($oui, $name)';
      var parm = { $oui: oui, $name: name };

      db.run(stmt, parm, function (err) {
        if (err) { console.warn(err); }
      });

      if (last) {
        rebuilding = false;
        return next();
      }
    })

  };

  fs.unlink(options.sql, function (err) {
    if (err) return next(err);
    var db = new sqlite3.Database(options.sql);

    options.db = db;

    var stmt = 'CREATE TABLE IF NOT EXISTS oui(oui TEXT PRIMARY KEY, name TEXT)';
    db.run(stmt, function (err) {
      if (err) { return next(err); }
      return process(db);
    });
  });

}


exports.rebuild = function (next) {

  if (rebuilding) {
    return next(new Error('Already Rebuilding'));
  }
  rebuilding = true;

  try {
    fs.unlinkSync(options.txt);
  } catch (e) {
    console.warn('unlinking problem', e);
  }

  request(options.url)
    .on('error', console.error)
    .on('end', function () {
      parse(next);
    })
    .pipe(fs.createWriteStream(options.txt));
};

exports.lookup = function (oui, next) {

  if (!oui || oui.length < 6) {
    return next(new Error('Invalid Request'),null);
  }

  var _oui = oui.split(/[-.:]/).join('').toUpperCase().substring(0,6);
  if (_oui.length != 6) {
    return next(new Error('invalid OUI'));
  }

  var db    = options.db;
  var query = 'SELECT * FROM oui WHERE oui=$oui LIMIT 1';
  var param = { $oui: _oui };

  db.get(query, param, function (err, row) {
    next(err ? err : null, (!!row) ? row.name : null);
  });

};

exports.each = function (each, next) {

  var db    = options.db;
  var query = 'SELECT * FROM oui';

  db.each(query, function (err, row) {
    each(err, row);
  }, next);

};
