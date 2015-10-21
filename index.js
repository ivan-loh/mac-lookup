var fs         = require('fs');
var http       = require('http');
var url        = require('url');
var sqlite3    = require('sqlite3').verbose();
var lineReader = require('line-reader');

/**
 * Fetches oui file
 */
var fetch = function(opts, next) {

  var handle  = function handle(res) {

    var outFile = fs.createWriteStream(opts.txt);

    var data  = function (chunk) {
      outFile.write(chunk);
    };
    var end   = function () {
      outFile.end();
      return next(null);
    };
    var close = function() {
      outFile.end();
      fs.unlink(txt, function () {
        return next(new Error('premature eof'));
      });
    };

    res.setEncoding('utf8');
    res.on('data', data).on('end', end).on('close', close);
  };

  var error   = function error(err) {
    return next(err, opts);
  };

  var options = url.parse(opts.url);
  options.agent = false;

  fs.unlink(opts.txt, function (err) {
    if (err) return next(err);

    http
      .request(options, handle)
      .on('error', error)
      .end();
  });

};

var parse = function (opts, next) {

  var process = function(db) {

    lineReader.eachLine(opts.txt, function(line) {
      var oui, name;
      line = line.trimLeft().trimRight();

      if (line.length > 15) {
	oui  = line.substr(0,8).split('-').join('');
	line = line.substr(9).trimLeft();
	if (line.substr(0,5) === '(hex)')
	  name = line.substr(6).trimLeft();
      }

      if ( (!!oui)            &&
	   (oui.length === 6) &&
	   (!!name)           &&
	   (name.length > 0)     ) {

	 var insertSTMT = 'INSERT INTO oui(oui, name) VALUES($oui, $name)';
	 var parameters = { $oui: oui, $name: name };
	 db.run(insertSTMT, parameters, function (err) {
	   if (err) console.warn(err);
	 });
      }
    }).then(function () {
      return next();
    });

  };

  fs.unlink(opts.sql, function (err) {
    if (err) return next(err);
    var db = new sqlite3.Database(opts.sql);
    opts.db = db;

    var createSTMT = 'CREATE TABLE IF NOT EXISTS oui(oui TEXT PRIMARY KEY, name TEXT)';
    db.run(createSTMT, function (err) {
      if (err) return next(err);
      return process(db);
    });
  });

};

var options = {
  url: 'http://standards-oui.ieee.org/oui.txt',
  sql: __dirname + '/oui.db',
  txt: __dirname + '/oui.txt'
};

options.db = new sqlite3.Database(options.sql);

exports.rebuild = function(next) {
  fetch(options, function(err) {
    if (err) return next(err);
    parse(options, function(err) {
      if (err) return next(err);
      return next(null);
    });
  });
};

exports.lookup = function (oui, next) {

  var _oui = oui.split('-').join('').split(':').join('').toUpperCase();
  if (_oui.length != 6)
    return next(new Error('invalid OUI'));

  var db    = options.db;
  var query = 'SELECT * FROM oui WHERE oui=$oui LIMIT 1';
  var param = { $oui: _oui };

  db.get(query, param, function (err, row) {
    next(err ? err : null, (!!row) ? row.name : null );
  });

};
