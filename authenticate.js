var ops = require('./ops');
var Crypto = require('cryptojs').Crypto;
var errors = require('./errors');


function authenticate(email, password, callback){
  var callback = callback || function(){};

  ops.view('users', 'by_email', {key: email}, function(view_error, view_results){
    if (view_error){
      return callback(view_error, null);
    }

    if (view_results.rows.length === 0){
      return callback(errors.emailNotFound(email), null);
    }

    user = view_results.rows[0].value;

    var password_hex = null;

    switch (user.password.algo){
      case 'md5': password_hex = Crypto.MD5(user.password.salt + password);
    }

    if (password_hex != user.password.hex){
      return callback(errors.incorrectPassword(), null);
    }

    return callback(null, user);
  });
}




module.exports = authenticate;
