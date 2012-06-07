var ops = require('./ops');
var errors = require('./errors');
var crypto = require('crypto');


function authenticate(email, password, callback){
  var callback = callback || function(){};

  ops.view('users', 'by_email', {key: email}, function(view_error, view_result){
    if (view_error){
      return callback(view_error, null);
    }

    if (view_result.rows.length === 0){
      return callback(
        errors.notFound('User not found by email: '+ email), 
        null
      );
    }

    user = view_result.rows[0].value;

    var password_hex = null;

    if (user.password.algo === 'pbkdf2'){
      crypto.pbkdf2(
        password, 
        user.password.salt, 
        user.password.iter, 
        user.password.hex.length /2, 
        function(pbkdf2_error, key){
          if (pbkdf2_error){
            return callback(pbkdf2_error, null);
          }

          password_hex = new Buffer(key, 'binary').toString('hex');

          return password_hex === user.password.hex ? 
            callback(null, user) : callback(errors.incorrectPassword(), null);
        }
      );
    }

    if (user.password.algo === 'md5'){
      password_hex = crypto.createHash('md5')
        .update(user.password.salt + password)
        .digest('hex');

      return password_hex === user.password.hex ? 
        callback(null, user) : callback(errors.incorrectPassword(), null);
    }
  });
}




module.exports = authenticate;
