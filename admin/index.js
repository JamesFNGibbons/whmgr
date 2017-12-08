const express = require('express');
const exphbs  = require('express-handlebars');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

let app = express();

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['test'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(2087, () => {
	console.log('ready on 2087');
});

let hbs = exphbs.create(
	{
		defaultLayout: 'main',
		helpers: {
			get_server_info: require('./helpers/get-server-info.js')
		},
		extname: ".hbs"
	}
);
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


// Setup mongodb
mongoose.connect('mongodb://localhost/whmgr', { useMongoClient: true });
mongoose.Promise = global.Promise;

app.use('/',require('./routes/home.js'));
app.use('/auth', require('./routes/auth.js'));
app.use('/services', require('./routes/services.js'));
