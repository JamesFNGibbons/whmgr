const router = require('express').Router();
const mysql = require('mysql');

/**
  * Route used to add a new database to
	* the clients account.
*/
router.post('/add', (req, res) => {
	if(req.session.client_loggedin){
		let account = req.session.client_username;
		let username = `${account}_du_${req.body.user}`;
		let database = `${account}_db_${req.body.name}`;
		let password = req.body.password;

		// Insert the details into the database.
		req.db.collection('databases').insert({
			account: account,
			username: username,
			password: password,
			database: database
		}, (err) => {
			if(err) throw err;
		});

		// Create the database, and user with mysql.
		let connection = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "my_password"
		});
		connection.connect();
		connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`, (err) => {
			if(err) throw err;
		});
		connection.query(`CREATE USER '${username}'@'localhost' IDENTIFIED BY '${password}'`, (err) => {
			if(err) throw err;
		});
		connection.query(`GRANT ALL PRIVILEGES ON ${database} . * TO '${username}'@'localhost';`, (err) => {
			if(err) throw err;
		});

		res.redirect('/clientarea/databases');
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to display the create database page.
*/
router.get('/add', (req, res) => {
	if(req.session.client_loggedin){
		res.render('databases/clientarea-add', {
			title: "Create Database",
			username: req.session.client_username
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to login to phpmyadmin, VIA GET.
*/
router.get('/do-phpmyadmin', (req, res) => {
	if(req.session.client_loggedin){
		let database = req.query.database
		if(database){
			req.db.collection('databases').find({
				database: database
			}).toArray((err, docs) => {
				if(err) throw err;
				else{
					if(docs.length > 0){
						req.db.collection('settings').find({
							name: 'url'
						}).toArray((err, setting) => {
							if(err) throw err;
							else{
								let url = setting[0].value;
								let username = docs[0].username;
								let password = docs[0].password;
								let pma_connection = `http://${url}/phpmyadmin/index.php?lang=en&server=1&pma_username=${username}&pma_password=${password}`;
								res.redirect(pma_connection);
							}
						});
					}
					else{
						res.end('Invalid database posted.');
					}
				}
			});
		}
	}
	else{
		res.end('Authentication error.');
	}
});

/**
  * Route used to login to phpmyadmin.
*/
router.post('/do-phpmyadmin', (req, res) => {
	if(req.session.client_loggedin){
		let database = req.body.database;
		if(database){
			req.db.collection('databases').find({
				database: database
			}).toArray((err, docs) => {
				if(err) throw err;
				else{
					if(docs.length > 0){
						req.db.collection('settings').find({
							name: 'url'
						}).toArray((err, setting) => {
							if(err) throw err;
							else{
								let url = setting[0].value;
								let username = docs[0].username;
								let password = docs[0].password;
								let pma_connection = `http://${url}/phpmyadmin/index.php?lang=en&server=1&pma_username=${username}&pma_password=${password}`;
								res.redirect(pma_connection);
							}
						});
					}
					else{
						res.end('Invalid database posted.');
					}
				}
			});
		}
	}
	else{
		res.redirect('/clientarea');
	}
});

/**
  * Route used to list the clients databases.
*/
router.get('/', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('databases').find({
			account: req.session.client_username
		}).toArray((err, databases) => {
			if(err) throw err;
			else{
				res.render('databases/clientarea-list', {
					title: "Databases",
					databases: databases
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to prompt a user to select their database.
*/
router.get('/select', (req, res) => {
	if(req.session.client_loggedin){
		// Get the users databases.
		let account = req.session.client_username;
		req.db.collection('databases').find({
			account: account
		}).toArray((err, databases) => {
			if(err) throw err;
			else{
				res.render('databases/clientarea-selectdb', {
					title: "Select Database",
					databases: databases
				});
			}
		});
	}
	else{
		res.redirect('/clientarea');
	}
});

module.exports = router;
