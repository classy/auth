var toJSON = JSON.stringify;


module.exports = {
  _id: '_design/users',
  language: 'javascript',
  validate_doc_update: function(new_doc, old_doc, user_context){

    function required(be_true, message){
      if (!be_true) throw { forbidden: message };
    }
  
    function unchanged(field) {
      if (old_doc && toJSON(old_doc[field]) != toJSON(new_doc[field]))
        throw({ forbidden : "Field can't be changed: " + field });
    }

    if (new_doc.type === 'user'){
      
      required(
        new_doc.hasOwnProperty('email'), 
        '`email` is required.'
      );

      required(
        new_doc.hasOwnProperty('password'), 
        '`password` is required'
      );

      var password = new_doc.password;

      required(
        password.hasOwnProperty('algo'), 
        '`password.algo` is required.'
      );

      required(
        password.hasOwnProperty('salt'), 
        '`password.salt` is required.'
      );

      required(
        password.hasOwnProperty('digest'), 
        '`password.digest` is required.'
      );

      if (password.algo === 'pbkdf2'){
        required(
          password.hasOwnProperty('iter'), 
          '`password.iter` is required.'
        );

        required(
          typeof password.iter == 'number',
          '`password.iter` must be a number.'
        );
      }
    }
  },
  views: {
    by_email: {
      map: function(doc){
        if (doc.type === 'user'){ emit(doc.email, null) }
      }
    }
  }
}

