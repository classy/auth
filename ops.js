var config = require('./config');
var designs = require('./db/designs');
var errors = require('./errors');
var nano = require('nano');
var async = require('async');



function initNano(){
  return nano(config.get('dbhost'));
}


function initDb(){
  return initNano().use(config.get('dbname'));
}



function save(){
  initDb().insert.apply(this, arguments);
}


function fetch(){
  initDb().get.apply(this, arguments);
}


function viewOrInsertDesign(){
  var design_name = arguments[0];
  var view_name = arguments[1];
  var callback = arguments[arguments.length -1] || function(){};
  var view_options = arguments.length === 4 ? arguments[2] : {};

  var db = initDb();

  db.view(design_name, view_name, view_options, function(view_error, view_result){
    if (view_error){
      if (view_error.error === 'not_found'){
        var design = designs[design_name];

        if (design === undefined){
          return callback(errors.designNotFound(design_name), null);
        }

        db.insert(design, design._id, function(insert_error, insert_result){
          if (insert_error){
            if (insert_error === 'conflict'){
              return callback(view_error, null);
            }
            return callback(insert_error, null);
          }

          viewOrInsertDesign(design_name, view_name, view_options, callback);
        });
        return
      }
      return callback(view_error, null);
    }
    return callback(null, view_result);
  });
}


function atomicOperation(doc_id, operation, callback){
  var callback = callback || function(){};

  fetch(doc_id, function(fetch_error, doc){
    if (fetch_error){
      return callback(fetch_error, null);
    }

    try {
      var altered_doc = operation(doc);
      if (!altered_doc){
        throw errors.operationDidNotReturnDoc();
      }
    } catch(operation_error){
      return callback(operation_error, null);
    }

    save(altered_doc, function(save_error, save_result){
      if (save_error){
        if (save_error.error === 'conflict'){
          atomicOperation.apply(this, arguments);
          return
        }
        return callback(save_error, null);
      }

      return callback(null, save_result);
    });
  });
}



module.exports = {
  initNano: initNano,
  initDb: initDb,
  save: save,
  fetch: fetch,
  view: viewOrInsertDesign,
  atomic: atomicOperation
}
