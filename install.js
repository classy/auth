var config = require('./config');



function install(callback){
  var async = require('async');
  var _ = require('underscore');

  var db_module = require('./models/db');
  var designs = require('./models/db/designs');

  var nano = db_module.nano();
  var db = db_module.db();

  var db_name = config.get('couchdb').database;


  async.series([
    // Create the database if it doesn't exist:
    function(async_callback){
      nano.db.get(db_name, function(get_error, result){
        if (!get_error) { return async_callback(null, result) }

        if (get_error.status_code === 404){
          return nano.db.create(db_name, async_callback);
        }

        return async_callback(get_error, null);
      });
    },

    // Insert design documents
    function(async_callback){
      var design_docs = [];
      for (design_name in designs) design_docs.push(designs[design_name]);
      db.bulk({ docs: design_docs }, async_callback);
    }
  ], callback);
}



module.exports = install;
