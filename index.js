var config = require('./config');

try {
  config.set(require('./local'));
} catch(e){}


module.exports = {
  config: config,
  create: require('./create'),
  fetch: require('./fetch'),
  modify: require('./modify'),
  list: require('./list'),
  authenticate: require('./authenticate'),
  _ops: require('./ops')
}
