'use strict';


var fs = require('fs');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();
var lineReader = require('line-reader');


var defaults = {
  url: 'http://linuxnet.ca/ieee/oui.txt',
  sql: __dirname + '/oui.db',
  txt: __dirname + '/oui.txt'
};

var val = function(key, config) {
  return config[key] || defaults[key];
};


var MacLookup = function(config) {
  var config = config || {};

  this.rebuilding = false;

  this.options = {};
  this.options.url = val('url', config);
  this.options.sql = val('sql', config);
  this.options.txt = val('txt', config);
  this.options.db = new sqlite3.Database(this.options.sql);

};

MacLookup.prototype.rebuild = function(next) {
  var ml = this;
  var parse = function(next) {

    var process = function(db) {
      var lineCount = 0;
      lineReader.eachLine(ml.options.txt, function(line, last) {
        lineCount++;//
        line = line.trimLeft().trimRight();
        if (line.length > 15) {
          // Get OUI
          var oui = line.substr(0, 8).split('-').join('');
          if ((oui) && (oui.length === 6)) {
            // Get Name
            var name;
            line = line.substr(9).trimLeft();
            if (line.substr(0, 5) === '(hex)') {
              name = line.substr(6).trimLeft();
            }
            if (name && name.length > 0) {
              var stmt = 'INSERT OR REPLACE INTO oui(oui, name) VALUES($oui, $name)';
              var parm = {
                $oui: oui,
                $name: name
              };

              db.run(stmt, parm, function(err) {
                if (err) {
                  console.warn(err);
                  console.warn(stmt);
                  console.warn(parm);
                }
              });
            }
          }
        }

        if (last) {
          ml.rebuilding = false;
          //console.log('Last entry read with', lineCount, 'lines');
          return next();
        }
      })

    };

    fs.unlink(ml.options.sql, function(err) {
      if (err) return next(err);
      ml.options.db = new sqlite3.Database(ml.options.sql);

      var stmt = 'CREATE TABLE IF NOT EXISTS oui(oui TEXT PRIMARY KEY, name TEXT)';
      ml.options.db.run(stmt, function(err) {
        if (err) {
          return next(err);
        }
        return process(ml.options.db);
      });
    });

  }


  if (this.rebuilding) {
    return next(new Error('Already Rebuilding'));
  }
  this.rebuilding = true;

  if (fs.existsSync(this.options.txt)) {
    try {
      fs.unlinkSync(this.options.txt);
    } catch (e) {
      console.warn('unlinking problem', e);
    }
  }
  request(this.options.url)
      .on('error', console.error)
      .on('end', function() {
        parse(next);
      })
      .pipe(fs.createWriteStream(this.options.txt));
};

MacLookup.prototype.lookup = function(oui, next) {

  if (!oui || oui.length < 6) {
    return next(new Error('Invalid Request'), null);
  }

  var _oui = oui.split(/[-.:]/).join('').toUpperCase().substring(0, 6);
  if (_oui.length != 6) {
    return next(new Error('invalid OUI'));
  }

  var query = 'SELECT * FROM oui WHERE oui=$oui LIMIT 1';
  var param = {
    $oui: _oui
  };

  this.options.db.get(query, param, function(err, row) {
    next(err ? err : null, (!!row) ? row.name : null);
  });

};

MacLookup.prototype.each = function(each, next) {
  var query = 'SELECT * FROM oui';

  this.options.db.each(query, function(err, row) {
    each(err, row);
  }, next);

};

module.exports = MacLookup;
