var _ = require('underscore');
var config = require('./config');
var errors = require('./errors');


function createPassword(){
  var password = arguments[0];
  var options = arguments.length === 3 ? arguments[1] : undefined;
  var callback = _.isFunction(arguments[arguments.length -1]) ? 
    arguments[arguments.length -1] : function(){};

  var algo = _.isString(config.get('password_algo')) ? 
    config.get('password_algo') : 'pbkdf2';

  var salt = crypto.randomBytes(
    _.isNumber(config.get('password_salt_length')) ?
      config.get('password_salt_length') : 16
  ).toString('hex');

  if (algo === 'pbkdf2'){
    var iter = _.isNumber(config.get('password_iter')) ? 
      config.get('password_iter') : 50000;

    var key_length = _.isNumber(config.get('password_key_length')) ? 
      config.get('password_key_length') : 16;

    return crypto.pbkdf2(password, salt, iter, key_length, function(err, key){
      if (err){
        return callback(err, null);
      }

      var digest = new Buffer(key, 'binary').toString('hex');

      return callback(null, {
        algo: algo,
        salt: salt,
        iter: iter, 
        digest: digest
      });

    });
  }

  if (algo === 'md5'){
    return callback(null, {
      algo: 'md5',
      salt: salt,
      digest: crypto.createHash('md5').update(salt + password).digest('hex')
    });
  }

  return callback(errors.configError(
    "'"+ algo +"' is not a supported encryption algorithm."
  ), null);
}


module.exports = {
  createPassword: createPassword
}
