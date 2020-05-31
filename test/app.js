'use strict';

var app    = require('../index');
var fs     = require('fs');
var should = require('should');

describe('mac-lookup', function (done) {

  before(done => {
    app.load(done);
  });

  it('should return a manufacturer', function (done) {
    app.lookup('000000', function (err, result){
      result.should.be.eql('XEROX CORPORATION');
      done();
    });
  });

  it('should handle dashes', function (done){
    app.lookup('00-00-00', function (err, result){
      result.should.be.eql('XEROX CORPORATION');
      done();
    });
  });

  it('should handle colons', function (done){
    app.lookup('00:00:00', function (err, result){
      result.should.be.eql('XEROX CORPORATION');
      done();
    });
  });

  it('should handle periods', function (done){
    app.lookup('0000.00', function (err, result){
      result.should.be.eql('XEROX CORPORATION');
      done();
    });
  });

  it('should handle full mac', function (done){
    app.lookup('00:00:00:00:00:00', function (err, result){
      result.should.be.eql('XEROX CORPORATION');
      done();
    });
  });

  it('should handle empty request returning nothing', function (done){
    app.lookup(null, function (err, results) {
      should.exist(err);
      should.not.exist(results);
      done();
    })
  });

  it('should iterate the whole db and expect proper data', function (done) {
    app.each(function (err, result) {
      result.oui.should.have.length(6);
      should.exist(result.name);
    }, done)
  });

  it('rebuilds without a hitch', function (done) {
    this.timeout(0);

    app.rebuild(function (err) {
      should.not.exist(err);
      var threshold = Date.now() - ( 1 * 60 * 60 * 1000);
      var stat      = fs.statSync('./oui.db');
      should.exist(stat);
      stat.mtime.getTime().should.be.above(threshold);

      done();
    })
  })

});
