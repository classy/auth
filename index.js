var config = require('./config');

try {
  config.set(require('./local'));
} catch(e){}


module.exports = {
  config: config,
  models: require('./models')
}
