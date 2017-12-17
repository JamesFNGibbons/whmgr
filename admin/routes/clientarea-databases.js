const router = require('express').Router();
const mysql = require('mysql');
const fs = require('fs');
const exec = require('child_process').exec;

/**
  * Route used to delete a users
  * database export.
*/
router.post('/exports/delete', (req, res) => {
	if(req.session.client_loggedin){
		if(req.body.the_export){
			let the_export = req.body.the_export;
			let account = req.session.client_username;
			let export_path = `/home/${account}/db-exports/${the_export}`;

			// Delete the export.
			if(fs.existsSync(export_path)){
				fs.unlink(export_path, (err) => {
					if(err) throw err;
					else{
						res.redirect('/clientarea/databases/exports?deleted=true');
					}
				});
			}
			else{
				res.end('Invalid Export.');
			}
		}
		else{
			res.end('Invalid export.')
		}
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to download a users
  * database export file.
 */
router.post('/exports/get', (req, res) => {
	if(req.session.client_loggedin){
		if(req.body.the_export){
			let the_export = req.body.the_export;
			let account = req.session.client_username;
			let export_path = `/home/${account}/db-exports/${the_export}`;

			if(fs.existsSync(export_path)){
				res.download(export_path);
			}
			else{
				res.end('The given export does not exist.');
			}
		}
		else{
			res.end('Invalid db export.');
		}
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to export the data
  * from the database.
*/
router.post('/exports/new', (req, res) => {
	if(req.session.client_loggedin){
		let database = req.body.database;
		let account = req.session.client_username;
		let date = new Date().toDateString().split(' ').join('');
		let export_file = `${account}_${database}_${date}.sql`;
		let export_path = `/home/${account}/db-exports/${export_file}`;

		// Export the data using the mysqldump command
		req.db.collection('databases').find({
			database: database
		}).toArray((err, db) => {
			if(err) throw err;
			else{
				if(db.length > 0) db = db[0];
				else res.end('Invalid Database.');
				exec(`mysqldump -u ${db.username} -p${db.password} ${database} > ${export_path}`, (err) => {
					if(err) throw err;
					else{
						res.redirect('/clientarea/databases/exports?exported=true');
					}
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to display the select
  * database screen, before running
  * the export.
*/
router.get('/exports/new', (req, res) => {
	if(req.session.client_loggedin){
		// List the users databases.
		req.db.collection('databases').find({
			account: req.session.client_username
		}).toArray((err, databases) => {
			if(err) throw err;
			else{
				res.render('databases/create-export', {
					title: "Select Database To Export",
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
  * Route used to display the view that
  * shows the database exports.
*/
router.get('/exports', (req, res) => {
	if(req.session.client_loggedin){
		// Generate the users export path.
		let exports_path = `/home/${req.session.client_username}/db-exports/`;
		// Create the db-exports directory if not exists
		if(!fs.existsSync(exports_path)){
			fs.mkdir(exports_path);
			res.redirect('/clientarea/databases/exports');
		}
		else{
			fs.readdir(exports_path, (err, the_exports) => {
				if(err) throw err;
				else{
					res.render('databases/exports', {
						title: "Database Exports",
						the_exports: the_exports,
						has_exports: the_exports.length,
						deleted: (req.query.deleted == 'true'),
						created: (req.query.export_created == 'true')
					});
				}
			})
		}
	}
	else{
		res.redirect('/');
	}
});

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

		// Check if the username is not too long
		let check_data = new Promise((resolve, reject) => {
			if(username.length >= 16){
				res.redirect('/clientarea/databases/add?username_length=true');
			} 
			else{
				if(database.length >= 16){
					res.redirect('/clientarea/databases/add?database_length=true');
				}
				else{
					resolve();
				}
			}
		});

		check_data.then(() => {
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
		});
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
			username: req.session.client_username,
			username_length: (req.query.username_length == 'true'),
			database_length: (req.query.database_length == 'true')
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to display the connection informatio
  * for a given database.
*/
router.get('/connection-info', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('databases').find({
			account: req.session.client_username,
			database: req.query.db
		}).toArray((err, docs) => {
			if(err) throw err;
			else{
				if(docs.length > 0){
					res.render('databases/connection-info', {
						title: "Database Info",
						database: docs[0]
					});
				}
				else{
					res.end('Invalid database.'); 
				}
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to delete a given database.
*/
router.post('/delete', (req, res) => {
	if(req.session.client_loggedin){
		let delete_db = function(username, database, callback){
			let connection = mysql.createConnection({
				host: "localhost",
				user: "root",
				password: "my_password"
			});
			connection.connect();
			connection.query(`DROP DATABASE ${database[0].database};`, (err) => {
				if(err) throw err;
			});
			connection.query(`DROP USER ${username};`, (err) => {
				if(err) throw err;
			});
			callback();	
		};

		let database = req.body.database;
		req.db.collection('databases').find({
			database: database
		}).toArray((err, database) => {
			let username = database[0].username;
			delete_db(username, database, () => {
				req.db.collection('databases').remove({
					database: database
				}, (err) => {
					if(err) throw err;
					else{
						res.redirect('/clientarea/databases?deleted=true');
					}
				});
			})
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to show the databases, with the
  * option to delete them.
*/
router.get('/delete', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('databases').find({
			account: req.session.client_username
		}).toArray((err, databases) => {
			if(err) throw err;
			else{
				res.render('databases/delete', {
					title: "Select database to delete",
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
					databases: databases,
					deleted: (req.query.deleted == 'true')
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
