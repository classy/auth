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


function createEmailVarificationVoucher(user_id, callback){
  var callback = callback || function(){};

  var voucher = {
    type: 'email_varification_voucher',
    creation_date: new Date(),
    user: {
      _id: user_id
    }
  }

  ops.save(voucher, callback);
}


function createPasswordResetVoucher(user_id, callback){
  var callback = callback || function(){};

  var voucher = {
    type: 'password_reset_voucher',
    creation_date: new Date(),
    user: {
      _id: user_id
    }
  }
}


function createAction(user_id, verb, subject){
  var callback = callback || function(){};

  var action = {
    type: 'action',
    creation_date: new Date(),
    user: {
      _id: user_id
    },
    verb: verb,
    subject: {
      _id: subject._id, 
      type: subject.type
    }
  }

  ops.save(action, callback);
}




module.exports = {
  user: createUser,
  emailVarificationVoucher: createEmailVarificationVoucher,
  passwordResetVoucher: createPasswordResetVoucher,
  action: createAction
}
