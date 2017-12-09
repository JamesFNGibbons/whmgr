const mongoose = require('mongoose');
mongoose.model('Accounts', new mongoose.Schema({
  username: 'string',
  password: 'string',
  domain: 'string'
}));
