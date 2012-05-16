var Crypto = require('cryptojs').Crypto;


function randomString(length){
  var lower_letters = 'abcdefghijklmnopqrstuvwxyz';
  var upper_letters = lower_letters.toUpperCase();
  var numbers = '1234567890';

  var chars = lower_letters + upper_letters + numbers;
  var random_string = '';

  for (var i=0; i < length; i++){
    var random_position = Math.floor(Math.random()*chars.length);
    var random_char = chars[random_position];

    random_string += random_char;
  }

  return random_string;
}


function createPassword(password){
  var salt = randomString(16);
  var hex = Crypto.MD5(salt + password);

  return {
    salt: salt,
    hex: hex,
    algo: 'md5'
  }
}


module.exports = {
  randomString: randomString,
  createPassword: createPassword
}
