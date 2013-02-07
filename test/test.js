var funct = require('..');
var should = require('should');

describe('funct', function() {
  describe('partial', function() {
    it('noop with noarg', function(done) {
      funct.partial(done)();
    });

    it('retains scope from definition', function(done) {
      var obj = {};
      funct.partial(function(result) {
        result.should.equal(obj);
        done();
      }, obj)();
    });

    it('adds given extras at the beginning', function(done) {
      funct.partial(function() {
        arguments.should.eql([1, 2, 3, 4]);
        done();
      }, 1, 2)(3, 4);
    });
  });

  describe('tack', function() {
    it('noop with noarg', function(done) {
      funct.tack(done)();
    });

    it('retains scope from definition', function(done) {
      var obj = {};
      funct.tack(function(result) {
        result.should.equal(obj);
        done();
      }, obj)();
    });

    it('adds given extras at the end', function(done) {
      funct.tack(function() {
        arguments.should.eql([1, 2, 3, 4]);
        done();
      }, 3, 4)(1, 2);
    });
  });

  describe('drop', function() {
    it('works with 0', function(done) {
      funct.drop(0)(function() {
        arguments.should.eql([null]);
        done();
      });
    });

    it('works with 2', function(done) {
      funct.drop(2)(1, 2, 3, 4, function() {
        arguments.should.eql([null, 3, 4]);
        done();
      })
    });

    it('exhausts the set', function(done) {
      funct.drop(4)(1, 2, 3, 4, function() {
        arguments.should.eql([null]);
        done();
      });
    });

    it('works for oob number', function(done) {
      funct.drop(10)(1, 2, 3, 4, function() {
        arguments.should.eql([null]);
        done();
      });
    });

    describe('dropAll', function() {
      it('works unsugared', function(done) {
        funct.drop(Infinity)(1, 2, 3, 4, 5, 6, 7, function() {
          arguments.should.eql([null]);
          done();
        });
      });
      it('works', function(done) {
        funct.dropAll(1, 2, 3, 4, 5, 6, 7, function() {
          arguments.should.eql([null]);
          done();
        });
      });
    });

    describe('dropEnd', function() {
      it('works for 2 unsugared', function(done) {
        funct.drop(0, -2)(1, 2, 3, 4, function() {
          arguments.should.eql([null, 1, 2]);
          done();
        });
      });
      it('works for 2', function(done) {
        funct.dropEnd(2)(1, 2, 3, 4, function() {
          arguments.should.eql([null, 1, 2]);
          done();
        });
      });
    });

    describe('dropSome', function() {
      it('seems to work', function(done) {
        funct.dropSome([2, 3, 5])(1, 2, 3, 4, 5, function() {
          arguments.should.eql([null, 1, 2, 5]);
          done();
        });
      });
    });
  });

  describe('rearrange', function() {
    it('seems to work', function(done) {
      funct.rearrange(function() {
        arguments.should.eql([3, 5]);
        done();
      }, [2, 4])(1, 2, 3, 4, 5);
    });
  });

  describe('err', function() {
    var noErr = new Error('should have called errback with an error.');
    var falseErr = new Error('should not have short circuit errored.');
    var falseOk = new Error('should not have passed through ok.');

    it('does nothing for null first arg', function(done) {
      funct.err(
        funct.partial(done, falseErr),
        funct.drop(1))(null, done);
    });

    it('short circuits for truthy first arg', function(done) {
      funct.err(function(err) {
        if (!err) return done(noErr);
        done()
      }, funct.partial(done, falseOk))(true);
    });
  });
});
