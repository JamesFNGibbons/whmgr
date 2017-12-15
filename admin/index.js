const express = require('express');
const exphbs  = require('express-handlebars');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongo = require('mongodb');
const glob = require('glob');
const path = require('path');
const expressmongodb = require('express-mongo-db');

let app = express();
let whmgr = require('./whmgr');

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
			get_server_info: require('./helpers/get-server-info.js'),
			ifeq: require('./helpers/ifeq.js'),
			neq: require('./helpers/neq.js')
		},
		extname: ".hbs"
	}
);
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Setup mongodb
app.use(expressmongodb('mongodb://localhost/whmgr'))

// Build the mongoose database.
glob.sync('./models/**/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});

if(whmgr.License.is_valid()){
	app.use('/',require('./routes/home.js'));
	app.use('/auth', require('./routes/auth.js'));
	app.use('/services', require('./routes/services.js'));
	app.use('/billing', require('./routes/billing.js'));
	app.use('/accounts', require('./routes/accounts.js'));
	app.use('/do-login', require('./routes/do-login.js'));
	app.use('/databases', require('./routes/databases.js'));
	app.use('/clientarea', require('./routes/clientarea-home.js'));
	app.use('/clientarea/databases', require('./routes/clientarea-databases.js'));
	app.use('/clientarea/email', require('./routes/email.js'));
}
else{
	app.use('/*', require('./routes/invalid-license.js'));
}
