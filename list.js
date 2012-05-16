var ops = require('./ops');
var _ = require('underscore');



function earliestUsers(){

  var view_options = arguments.length === 2 ? arguments[0] : {};
  var callback = arguments[arguments.length -1];

  ops.view('users', 'by_creation_date', view_options, callback);
}

function latestUsers(){
  var options = arguments.length === 2 ? arguments[0] : {};
  var callback = arguments[arguments.length -1];

  var default_view_options = {
    descending: true
  }

  var view_options = _.extend(default_view_options, options);

  ops.view('users', 'by_creation_date', view_options, callback);
}



module.exports = {
  earliest: {
    users: earliestUsers
  },
  latest: {
    users: latestUsers
  }
}
