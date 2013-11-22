var _ = require('underscore');



module.exports = (function(){
  var configs = {}

  return {
    set: function(key, value){
      switch (arguments.length){
        case 1: _.extend(configs, key); return key;
        case 2: configs[key] = value; return value;
      }
    },

    get: function(key){
      return key ? configs[key] : configs;
    }
  }
})()
