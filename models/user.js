var _ = require('lodash');

var Doc = require('./doc');
var db = require('./db').db;
var utils = require('../utils');
var errors = require('../errors');
var design = require('./db/designs/user');



var User = function User(id){
  if (!(this instanceof User)) return new User(id);
  if (id) { this.id = id; }
  this.type = 'user';
}


User.identify = function identifyUserByEmail(email, callback){
  var view_opts = {
    key: email,
    include_docs: true
  }

  db().view(
    'users', 
    'by_email', 
    view_opts,
    function(view_error, view_result){
      if (view_error){ return callback(view_error, null) }
      if (!view_result.rows.length){
        return callback(
          errors.notFound('User not found by email: '+ email), 
          null
        )
      }

      return callback(null, view_result.rows[0].doc)
    }
  );
};


User.createPassword = utils.createPassword;


User.prototype = new Doc();


User.prototype.validate = function validateUser(callback){
  var self = this;

  try {
    design.validate_doc_update(self.tmp.doc_body, self.tmp.old_doc_body);
  } catch (validation_error){
    return callback(validation_error, null);
  }

  if (!self.tmp.doc_body._rev){
    var email = self.tmp.doc_body.email;

    return User.identify(email, function(identification_error, user){
      if (user){
        return callback(errors.emailInUse(email), null);
      }

      return Doc.prototype.validate.call(self, callback);
    });
  }

  return Doc.prototype.validate.call(self, callback);
}


User.prototype.create = function createUser(
  doc_body,
  callback
){
  doc_body.type = 'user';
  Doc.prototype.create.call(this, doc_body, callback);
}


User.prototype.email = function changeEmail(new_email, callback){
  db().view(
    'users', 
    'by_email', 
    { key: new_email }, 
    function(view_error, view_result){
      if (view_error){ return callback(view_error, null) }
      if (view_result.rows.length !== 0){
        return callback(errors.emailInUse(new_email), null);
      }

      this.updateField('email', new_email, callback);
    }
  );
}


User.prototype.password = function changePassword(new_password, callback){
  var self = this;

  utils.createPassword(
    new_password, function(password_creation_error, new_password_object){
      if (password_creation_error){
        return callback(password_creation_error, null)
      }

      self.updateField('password', new_password_object, callback);
    }
  );
}


User.prototype.authenticate = function authenticateUser(password, callback){
  var self = this;

  self.read(function(read_error, user_doc){
    if (read_error){ return callback(errors.notFound(), null) }
    
    var password_object = user_doc.password;

    switch (password_object.algo){
      case 'pbkdf2':
        crypto.pbkdf2(
          password,
          password_object.salt,
          password_object.iter,
          password_object.digest.length /2,
          function (pbkdf2_error, key){
            if (pbkdf2_error){ return callback(pbkdf2_error, null) }

            password_digest = new Buffer(key, 'binary').toString('hex');

            if (password_digest === password_object.digest) {
              return callback(null, user_doc)
            }

            return callback(errors.incorrectPassword(), null)
          }
        ); 
        break;

      case 'md5':
        password_digest = crypto.createHash('md5')
          .update(password_object.salt + password)
          .digest('hex');

        if (password_digest === password_object.digest){ 
          return callback(null, user_doc); 
        }

        return callback(errors.incorrectPassword(), null);
        break;
    }
  });
}


User.prototype.mark = function markUser(mark_name, callback){
  var self = this;

  self.read(function(read_error, doc_body){
    if (read_error){ return callback(read_error, null) }
    if (doc_body.marked && doc_body.marked[mark_name]){
      return callback(errors.alreadyMarked(mark_name), null)
    }

    var marks = _.clone(doc_body.marked || {});
    marks[mark_name] = new Date();

    self.updateField('marked', marks, callback);
  });
}


User.prototype.unmark = function unmarkUser(mark_name, callback){
  var self = this;

  self.read(function(read_error, doc_body){
    if (read_error){ return callback(read_error, null) }
    if (!doc_body.marked || !doc_body.marked[mark_name]){
      return callback(errors.notMarked(mark_name), null)
    }

    var marks = _.clone(doc_body.marked);
    delete marks[mark_name];

    if (_.isEmpty(marks)){
      return self.updateField('marked', undefined, callback);
    }

    return self.updateField('marked', marks, callback);
  });
}


User.prototype.preference = function setUserPreference(){
  var self = this;
  var key;
  var value;
  var callback = arguments[arguments.length -1];
  
  switch(arguments.length){
    case 2: key = arguments[0]; break;
    case 3: key = arguments[0]; value = arguments[1]; break;
  }

  self.read(function(read_error, doc_body){
    if (read_error) return callback(read_error, null);
    var preferences = doc_body.preferences || {};
    preferences[key] = value;

    if (preferences[key] === undefined) delete preferences[key];

    if (!Object.keys(preferences).length){
      preferences = undefined;
    }

    return self.updateField('preferences', preferences, callback);
  });
}



module.exports = User;
