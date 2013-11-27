var should = require('should');

var auth = require('../');
var User = auth.models.User;
var config = auth.config;


// Use testing settings
config.set('couchdb', config.get('couchdb_testing'));

var nano = require('../models/db').nano();
var database_name = auth.config.get('couchdb').database;




suite('A User', function(){
  suiteSetup(function(done){
    auth.install(done)
  });

  suiteTeardown(function(done){
    nano.db.destroy(database_name, done);
  });

  function instantiatedOkay(user){
    test('should return an instance of `User`.', function(){
      user.should.be.an.instanceOf(User);
    });

    test('should be of type "user".', function(){
      user.should.have.property('type', 'user');
    });
  }

  function canBeCreatedReadAndDeleted(user, email){
    test('can be created.', function(done){
      user.create({
        email: email,
        password: 'derp'
      }, done)
    });
    
    test('can be read', function(done){ user.read(done) });
    test('can be deleted', function(done){ user.delete(done) });
  };

  test('can be instantiated without an `id`', function(){
    var user = new User()
    instantiatedOkay();
  })

  test('can be instantiated with an `id`', function(){
    var user = new User('1234')
    instantiatedOkay();

    user.should.have.property('id', '1234');
  })

  suite('object instantiated without an `id`', function(){
    var user = new User();
    canBeCreatedReadAndDeleted(user, 'test1@classy.co');
  });

  suite('object instantiated with an `id`', function(){
    var user = new User('123');
    canBeCreatedReadAndDeleted(user, 'test2@classy.co');
  });

  suite('when instantiated with an `id`', function(){
    var user = new User('1234');

    test('has an `id`.', function(){
      user.should.have.property('id', '1234');
    });

    suite('when created and read', function(){
      var user_doc;

      suiteSetup(function(done){
        user.create({
          email: 'test3@classy.co',
          password: 'derp'
        }, function(creation_error, creation_result){
          user.read(function(read_error, read_result){
            if (read_error) return done(read_error);
            user_doc = read_result;
            return done();
          });
        });
      });
  
      suiteTeardown(function(done){
        user.delete(done);
      });

      test('the user doc has the `id` given at instantiation.', function(){
        user_doc.should.have.property('_id', '1234');
      });
    });
  });

  suite('when created', function(){
    var user = new User();

    suiteSetup(function(done){
      user.create({
        email: 'test@classy.co',
        password: 'wow'
      }, done);
    });

    suiteTeardown(function(done){
      user.delete(done);
    });

    suite('and read', function(){
      var user_body;

      suiteSetup(function(done){
        user.read(function(err, res){
          if (err) return done(err);
          user_body = res;
          done();
        });
      });

      test('has the necessary properties.', function(){
        user_body.should.be.an.instanceOf(Object);
        user_body.should.have.property('type', 'user');
        user_body.should.have.property('_id', user.id);
        user_body.should.have.property('_rev');
        user_body.should.have.property('email', 'test@classy.co');

        user_body.should.have.property('password');
        user_body.password.should.be.an.instanceOf(Object);
        user_body.password.should.have.property('algo');
        user_body.password.should.have.property('salt');
        user_body.password.should.have.property('digest');

        if (config.get('password_algo') == 'pbkdf2'){
          user_body.password.should.have.property(
            'iter',
            config.get('password_iter')
          );
        }
      });

      test('has a valid `cration_date`');
    });

    test('it can be identified by its `email`', function(done){
      User.identify('test@classy.co', function(error, result){
        if (error) return done(error);
        result.should.be.an.instanceOf(Object);
        result.should.have.property('_id', user.id);
        return done()
      })
    })

    test('it can be authenticated using its password.', function(done){
      user.authenticate('wow', function(auth_error, auth_result){
        if (auth_error) return done(auth_error);
        should(auth_error).not.be.ok;
        auth_result.should.be.an.instanceOf(Object);
        return done();
      })
    });

    test('it cannot be authenticated using another password.', function(done){
      user.authenticate('wowzers', function(auth_error, auth_result){
        auth_error.should.be.an.instanceOf(Object);
        auth_error.should.have.property('error', 'incorrect_password');
        should(auth_result).not.be.okay;
        return done();
      })
    });

    suite('and its', function(){
      test('email can be changed.', function(done){
        user.email('test@example.com', done);
      });

      suite('email is changed', function(){
        var change_result;

        suiteSetup(function(done){
          user.email('jeffler@classy.co', function(error, result){
            if (error) return done(error);
            change_result = result;
            return done();
          })
        })

        test('it can be identified by its `email`', function(done){
          User.identify('jeffler@classy.co', function(error, result){
            if (error) return done(error);
            result.should.be.an.instanceOf(Object);
            result.should.have.property('_id', user.id);
            return done()
          })
        })

        suite('and read', function(){
          var user_doc;

          suiteSetup(function(done){
            user.read(function(error, doc){
              if (error) return done(error);
              user_doc = doc;
              return done();
            });
          })

          test('the new email as been set.', function(){
            user_doc.should.have.property('email', 'jeffler@classy.co');
          });
        });
      });

      test('password can be changed.', function(done){
        user.password('dog', done);
      });

      suite('password is changed', function(){
        var old_doc_body;
        var change_result;

        suiteSetup(function(done){
          user.read(function(read_error, doc){
            if (read_error) return done(read_error);
            old_doc_body = doc;

            user.password('derpmond', function(error, result){
              if (error) return done(error);
              change_result = result;
              return done();
            })
          })
        })

        test('it can be authenticated with the new password.', function(done){
          user.authenticate('derpmond', function(auth_error, auth_result){
            if (auth_error) return done(auth_error);
            auth_result.should.be.an.instanceOf(Object);
            auth_result.should.have.property('_id', user.id);
            done();
          });
        });

        test(
          'it cannot be authenticated with the old password.', 
          function(done){
            user.authenticate('dog', function(auth_error, auth_result){
              auth_error.should.be.an.instanceOf(Object);
              auth_error.should.have.property('error', 'incorrect_password')
              should(auth_result).not.be.ok;
              done();
            });
          }
        );

        suite('and read', function(){
          var user_doc;

          suiteSetup(function(done){
            user.read(function(error, doc){
              if (error) return done(error);
              user_doc = doc;
              return done();
            });
          })

          test('the new password as been set.', function(){
            user_doc.password.should.not.have.property(
              'digest', 
              old_doc_body.password.digest
            );
          });
        });
      });

      test('preference can be set.', function(done){
        user.preference('tippin_on', 'fo-fos', done);
      });

      suite('preference is set', function(){
        suiteSetup(function(done){
          user.preference('turnt_up', true, done);
        });

        test('the preference can be read', function(done){
          user.read(function(error, result){
            should(error).not.be.ok;
            result.should.be.ok;
            result.should.have.property('preferences');
            result.preferences.should.have.property('turnt_up', true);
            done()
          });
        });

        test('the preference can be unset', function(done){
          user.preference('turnt_up', undefined, done);
        });

        suite('and unset', function(){
          suiteSetup(function(done){
            user.preference('fresh_2_def', true, function(error, result){
              if (error) return done(error);
              user.preference('fresh_2_def', undefined, done)
            });
          });

          test('the preference can no longer be read.', function(done){
            user.read(function(error, user_doc){
              should(error).not.be.okay;
              if(user_doc.preferences){
                user_doc.preferences.should.not.have.property('fresh_2_def');
              }

              return done();
            })
          })
        });
      });
    });

    suite('and it\'s', function(){

      suite('marked', function(){
        suiteSetup(function(done){
          user.mark('stupid', done);
        });

        suite('and the user is read', function(){
          var user_body;

          suiteSetup(function(done){
            user.read(function(err, res){
              if (err) return done(err);
              user_body = res;
              return done();
            });
          });

          test('`marked` should have the property with the mark name.', function(){
            user_body.should.have.property('marked');
            user_body.marked.should.have.property('stupid');
          });

          suite('and unmarked', function(){
            suiteSetup(function(done){
              user.unmark('stupid', done);
            });

            suite('and the user is read', function(){
              var user_body;
    
              suiteSetup(function(done){
                user.read(function(err, res){
                  if (err) return done(err);
                  user_body = res;
                  return done();
                });
              });
    
              test('the `marked` field is empty', function(){
                if (user_body.marked){
                  user_body.should.not.have.property('stupid');
                }
              });
            });
          });
        });
      });
    });
  });
});
