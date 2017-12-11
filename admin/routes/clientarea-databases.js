const router = require('express').Router();

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