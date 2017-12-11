const router = require('express').Router();
const mysql = require('mysql');

/**
  * Route used to list the databases that
  * have been created.
*/
router.get('/', (req, res) => {
	if(!req.session.loggedin){
		res.redirect('/');
	}
	req.db.collection('databases').find().toArray((err, databases) => {
		if(err) throw err;
		else{
			res.render('databases/list', {
				title: "View Databases",
				databases: databases,
				db_created: req.query['db-created']
			});
		}
	});
});

/**
  * Route used to add a new database.
*/
router.post('/add', (req, res) => {
	if(!req.session.loggedin){
		redirect('/');
	}
	
	let username = req.body.account;
	let db_name = username + '_db_' + req.body.name;
	let db_user = username + '_du_' + req.body.username;
	let db_pass = req.body.password;

	// Create the new database.
	let connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'my_password',
	});
	connection.connect();
	connection.query("CREATE DATABASE IF NOT EXISTS " + db_name, (err) => {
		if(err) throw err;
	});
	connection.query(`CREATE USER '${db_user}'@'localhost' IDENTIFIED BY '${db_pass}'`, (err) => {
		if(err) throw err;
	});
	connection.query(`GRANT ALL PRIVILEGES ON ${db_name} . * TO '${db_user}'@'localhost';`, (err) => {
		if(err) throw err;
	});

	// Add the new database account details to the whmgr db
	req.db.collection('databases').insert({
		account: username,
		username: db_user,
		password: db_pass,
		database: db_name
	}, (err) => {
		if(err) throw err;
		else{
			res.redirect('/databases?db-created');
		}
	});
});

/**
  * Route used to add a database.
*/
router.get('/add', (req, res) => {
	if(!req.session.loggedin){
		res.redirect('/');
	}

	if(req.query.username){
		res.render('databases/add', {
			title: "Add Database",
			username: req.query.username
		});
	}
	else{
		req.db.collection('accounts').find().toArray((err, accounts) => {
			res.render('databases/select-account', {
				title: "Select Account",
				accounts: accounts
			});
		});
	}
});

module.exports = router;