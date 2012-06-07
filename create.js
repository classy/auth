var async = require('async');

var ops = require('./ops');
var errors = require('./errors');
var utils = require('./utils');



function createUser(email, password, callback){
  var callback = callback || function(){};

  async.series([
    function(series_callback){
      ops.view('users', 'by_email', {key: email}, 
        function(view_err, view_result){
          if (view_err || view_result.rows.length){
            return series_callback(view_err || errors.emailInUse(email), null);
          }

          return series_callback(null, {email_in_use: false});
        }
      );
    },
    function(series_callback){
      utils.createPassword(password, 
        function(create_password_error, password_literal){
          if (create_password_error){
            return series_callback(create_password_error, null);
          }

          return series_callback(null, {password: password_literal});
        }
      );
    }
  ], function(series_err, result){
    if (series_err){
      return callback(series_err, null);
    }

    var new_user = {
      email: email,
      creation_date: new Date(),
      type: 'user',
      password: result[1].password
    }

    return ops.save(new_user, callback);
  });
}


function createAction(user_id, verb, subject, callback){
  var callback = callback || function(){};

  utils.exists(user_id, function(existence_error, exists){
    if (existence_error){
      return callback(existence_error, null);
    }

    if (exists === false){
      return callback(
        errors.notFound('User "'+ user_id +'" not found.'), null);
    }

    var new_action = {
      user: {
        _id: user_id
      },
      type: 'action',
      creation_date: new Date(),
      verb: verb,
      subject: {
        _id: subject._id,
        type: subject.type
      }
    }

    ops.save(new_action, callback); 
  });
}


function createVoucher(user_id, voucher_name, callback){
  var callback = callback || function(){};

  utils.exists(user_id, function(existence_error, exists){
    if (existence_error){
      return callback(existence_error, null);
    }

    if (exists === false){
      return callback(errors.doesNotExist(user_id), null);
    }

    var new_voucher = {
      type: 'voucher',
      name: voucher_name,
      creation_date: new Date(),
      user: {
        _id: user_id
      }
    }

    return ops.save(new_voucher, callback);
  });
}




module.exports = {
  user: createUser,
  action: createAction,
  voucher: createVoucher
}
