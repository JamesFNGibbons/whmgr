const router = require('express').Router();
const fs = require('fs');
const exec = require('child_process').exec;

/**
  * Route used to display the created email addresses.
*/
router.get('/', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('email_accounts').find({
			account: req.session.client_username
		}).toArray((err, accounts) => {
			res.render('email/list.hbs', {
				title: "Email Accounts",
				accounts: accounts
			});
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Router used to create the new account.
*/
router.post('/create', (req, res) => {
	if(req.session.client_loggedin){
		let create_user = new Promise((resolve, reject) => {
			// Check if the mail dir exists in the account home
			if(!fs.existsSync(`/home/${req.session.client_username}/mail`)){
				fs.mkdirSync(`/home/${req.session.client_username}/mail`);
			}

			// Create the user account.
			req.db.collection('settings').find({
				name: 'url'
			}).toArray((err, setting) => {
				if(err) throw err;
				else{
					let url = setting[0].value;
					let username = `${req.body.username}@${url}`;
					let password = req.body.password;
					let account = req.session.client_username;

					// Create the new mail users homedir
					if(!fs.existsSync(`/home/${account}/mail/${username}`)){
						fs.mkdirSync(`/home/${account}/mail/${username}`);
					}

					exec(`adduser ${username} --force-badname --home /home/${account}/mail/${username}`, (err) => {
						if(err) throw err;
						else{
							res.redirect('/clientarea/email');
						}
					});
				}
			});
		});

		let get_username = new Promise((resolve, reject) => {
			req.db.collection('accounts').find({
				username: req.session.client_username
			}).toArray((err, docs) => {
				if(err) throw err;
				else{
					let url = docs[0].domain;
					resolve(`${req.body.username}@${url}`);
				}
			});
		});

		let address_used = new Promise((resolve, reject) => {
			if(req.body.username){
				get_username.then((username) => {
					req.db.collection('email_accounts').find({
						username: username
					}, (err, accounts) => {
						if(err) throw err;
						else{
							if(accounts.length > 0){
								resolve(true);
							}
							else{
								resolve(false);
							}
						}
					});
				})
			}
			else{
				res.redirect('/');
			}
		});

		// Check if the email is used.
		address_used.then((used) => {
			if(used){
				res.redirect('/clientarea/add?email_exists');
			}
			else{
				get_username.then((username) => {
					create_user.then(() => {
						req.db.collection('email_accounts').insert({
							username: username,
							password: req.body.password,
							account: req.session.client_username
						}, (err) => {
						if(err) throw err;
							else{
								res.redirect('/clientarea/email?account_created');
							}
						});
					})
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to create a new email account.
*/
router.get('/create', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('accounts').find({
			username: req.session.client_username
		}).toArray((err, account) => {
			if(account.length > 0){
				let user = account[0];
				res.render('email/add', {
					title: "Add email account",
					domain: user.domain,
					email_exists: req.query.email_exists
				});
			}
			else{
				res.end('Invalid account.');
			}
		});
	}	
	else{
		res.redirect('/');
	}
});

/**
  * Route used to authenticate a user to webmail.
*/
router.get('/webmail', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('settings').find({name: 'url'}).toArray((err, docs) => {
			if(err) throw err;
			else{
				res.redirect(`http://${docs[0].value}/webmail`);
			}
		});
	}
	else{
		res.redirect('/');
	}
});

module.exports = router;