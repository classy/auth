var Doc = require('./doc');
var design = require('./db/designs/vouchers');



// Creating a Voucher:
//
// > var voucher = new Voucher();
// > voucher.create({
// ...  user: { _id: 1234 },
// ...  name: 'email_confirmation'
// ...  }, callback)


var Voucher = function Voucher(id){
  if (!(this instanceof Voucher)) return new Vouch(id);
  if (id) { this.id = id; }
  this.type = 'voucher';
}


Voucher.prototype = new Doc();


Voucher.prototype.validate = function validateVoucher(callback){
  var self = this;

  try {
    design.validate_doc_update(self.tmp.doc_body, self.tmp.old_doc_body);
  } catch (validation_error){
    return callback(validation_error, null);
  }

  var user = new Doc(self.tmp.doc_body.user._id);

  user.exists(function(existence_error, user_exists){
    if (existence_error) return callback(existence_error, null);
    if (!user_exists) return callback({
      error: "does_not_exist",
      message: "This user does not exist: "+ user.id
    }, null);

    return Doc.prototype.validate.call(self, callback);
  });
}


Voucher.prototype.create = function createVoucher(
  doc_body,
  callback
){
  doc_body.creation_date = (new Date()).getTime();
  Doc.prototype.create.call(this, doc_body, callback);
}



module.exports = Voucher;
