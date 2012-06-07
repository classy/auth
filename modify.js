var ops = require('./ops');
var errors = require('./errors');
var utils = require('./utils');
var _ = require('underscore');




function modifyDocumentField(doc_id, field_name, value, callback){
  var callback = callback || function(){};

  ops.atomic(doc_id, function(doc){
    doc[field_name] = value;
    return doc;
  }, callback);
}


function markDocument(doc_id, mark_name, callback){
  var callback = callback || function(){};

  function mark(doc){
    if (doc.marked === undefined){
      doc.marked = {};
    }

    if (doc.marked[mark_name]){
      throw errors.alreadyMarked(mark_name);
    }

    doc.marked[mark_name] = new Date();
    return doc;
  }

  ops.atomic(doc_id, mark, callback);
}


function unmarkDocument(doc_id, mark_name, callback){
  var callback = callback || function(){};

  function unmark(doc){
    if (!doc.marked[mark_name]){
      throw errors.notMarked(mark_name);
    }

    delete doc.marked[mark_name];

    if (_.isEmpty(doc.marked)){
      delete doc.marked;
    }

    return doc;
  }

  ops.atomic(doc_id, unmark, callback);
}


function modifyEmail(user_id, email, callback){
  var callback = callback || function(){};

  // check that there is not already another user with this email
  ops.view('users', 'by_email', {key: email}, function(view_error, view_result){
    if (view_error){
      return callback(view_error, null);
    }

    if (view_result.rows.length){
      return callback(errors.emailInUse(email), null);
    }

    modifyDocumentField(user_id, 'email', email, callback);
  });
}


function modifyPassword(user_id, password, callback){
  var callback = callback || function(){};

  utils.createPassword(password, function(password_creation_error, password_object){
    if (password_creation_error){
      return callback(password_creation_error, null);
    }

    return modifyDocumentField(user_id, 'password', password_object, callback);
  });
}


function modifyLastLogin(user_id, last_login, callback){
  var callback = callback || function(){};

  modifyDocumentField(user_id, 'last_login', last_login, callback);
}


function modifyPreference(user_id, key, value, callback){
  var callback = callback || function(){};

  ops.atomic(user_id, function(user){
    if (user.preferences === undefined){
      user.preferences = {};
    }

    user.preferences[key] = value;

    if (_.isEmpty(user.preferences)){
      delete user.preferences;
    }

    return user;
  }, callback);
}




module.exports = {
  user: {
    email: modifyEmail,
    password: modifyPassword,
    lastLogin: modifyLastLogin,
    preference: modifyPreference,
    mark: markDocument,
    unmark: unmarkDocument
  }
}
