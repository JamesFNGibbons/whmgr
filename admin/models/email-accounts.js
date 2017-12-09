const mongoose = require('mongoose');
mongoose.model('Accounts', new mongoose.Schema({
  Email: 'string',
  Password: 'string',
  Domain: 'string'
}));
