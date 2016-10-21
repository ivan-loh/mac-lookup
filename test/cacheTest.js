'use strict';

var app    = require('../index');
var fs     = require('fs');
var should = require('should');
var path   = require('path');

const databaseFile = path.join(__dirname, 'testOui.db');
app = new app({useCachedTxt: true, txt:path.join(__dirname, 'testOui.txt'), url: 'Not valid', sql: databaseFile});

describe('mac-lookup-cached', function (done) {
    it('rebuilds without a hitch', function (done) {
        app.rebuild(function (err) {
            should.not.exist(err);
            var stat      = fs.statSync(databaseFile);
            should.exist(stat);
            done();
        })
    })

});
