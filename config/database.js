const crypto = require('crypto').randomBytes(256).toString('hex');
config =  {
  uri:'mongodb://127.0.0.1:27017/mean-db',
  secret:crypto,
  db:'mean-db'
}
module.exports = config;
