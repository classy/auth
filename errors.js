// TODO: Consolidate not found errors into one error. Maybe even include
// doesnotexist in that bunch too.


module.exports = {
  notFound: function(message){
    return {
      error: 'not_found',
      message: message
    }
  },
  emailInUse: function(email){
    return {
      error: 'email_in_use',
      message: "Email '"+ email +"' is already being used by another member."
    }
  },
  operationDidNotReturnDoc: function(){
    return {
      error: 'operation_did_not_return_doc',
      message: "The atomic operation did not return a document."
    }
  },
  designNotFound: function(design_name){
    return {
      error: 'design_not_found',
      message: "The design '"+ design_name +"' could not be found."
    }
  },
  emailNotFound: function(email){
    return {
      error: 'email_not_found',
      message: "Could not find a user with email '"+ email +"'."
    }
  },
  incorrectPassword: function(){
    return {
      error: 'incorrect_password',
      message: 'Incorrect password.'
    }
  },
  doesNotExist: function(id){
    return {
      error: 'does_not_exist',
      message: "'"+ id +"' does not exist."
    }
  },
  argumentError: function(message){
    return {
      error: 'argument_error',
      message: message
    }
  },
  configError: function(message){
    return {
      error: 'config_error',
      message: message
    }
  }
}
