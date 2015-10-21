'use strict';

var app    = require('../index');
var should = require('should');

describe('mac-lookup', function (done) {

  it('should return a manufacturer', function (done) {
    app.lookup('000000', function (err, result){
      result.should.be.eql('XEROX CORPORATION');
      done();
    });
  });

  it('should handles dashes', function (done){
    app.lookup('00-00-00', function (err, result){
      result.should.be.eql('XEROX CORPORATION');
      done();
    });
  });

  it('should handles colons', function (done){
    app.lookup('00:00:00', function (err, result){
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

});
