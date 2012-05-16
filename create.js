var ops = require('./ops');
var errors = require('./errors');
var utils = require('./utils');



function createUser(email, password, callback){
  var callback = callback || function(){};
  
  // check that there is not already a user with this email
  ops.view('users', 'by_email', {key: email}, function(view_error, view_result){
    if (view_error){
      return callback(view_error, null);
    }

    if (view_result.rows.length){
      return callback(errors.emailInUse(email), null);
    }

    var user = {
      email: email,
      creation_date: new Date(),
      type: 'user',
      password: utils.createPassword(password)
    }

    ops.save(user, callback);
  });
}


function createVoucher(voucher_name, user_id, callback){
  var callback = callback || function(){};

  var voucher = {
    type: 'voucher',
    name: voucher_name,
    creation_date: new Date(),
    user: {
      _id: user_id
    }
  }

  ops.save(voucher, callback);
}




module.exports = {
  user: createUser,
  voucher: createVoucher
}
