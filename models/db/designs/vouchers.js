var toJSON = JSON.stringify;


module.exports = {
  _id: '_design/vouchers',
  language: 'javascript',
  validate_doc_update: function(new_doc, old_doc, user_context){

    function required(be_true, message){
      if (!be_true) throw { forbidden: message };
    }
  
    function unchanged(field) {
      if (old_doc && toJSON(old_doc[field]) != toJSON(new_doc[field]))
        throw({ forbidden : "Field can't be changed: " + field });
    }

    if (new_doc.type === 'voucher'){
      
      required(
        new_doc.hasOwnProperty('user'), 
        '`user` is required.'
      );

      required(
        new_doc.user.hasOwnProperty('_id'),
        '`user._id` is required.'
      );

      required(
        new_doc.hasOwnProperty('name'),
        '`name` is required.'
      );

      required(
        typeof new_doc.name === 'string',
        '`name` must be a string.'
      );
    }
  }
}

