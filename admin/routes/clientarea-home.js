const router = require('express').Router();
const fs = require('fs');
const exec = require('child_process').exec;

/**
  * Route used to check the login of a user.
*/
router.post('/', (req, res) => {
	if(!req.session.client_loggedin){
		let username = req.body.username;
		let password = req.body.password;

		req.db.collection('root_users').find({
			username: username
		}).toArray((err, docs) => {
			if(err) throw err;
			else{
				// Check if the user is a root account
				if(docs.length > 0){
				}
				else{
					req.session.client_loggedin = true;
					req.session.client_username = username,
					res.redirect('/clientarea');
				}
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to show the client their
  * billings.
*/
router.get('/billing', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('bills').find({
			account: req.session.client_username
		}).toArray((err, bills) => {
			if(err) throw err;
			else{
				res.render('billing/clientarea-view', {
					title: "Bills",
					bills: bills
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to display the export
  * files controls.
*/
router.get('/export-files', (req, res) => {
	if(req.session.client_loggedin){
		let account = req.session.client_username;

		// Create the users exports folder if it does not exist.
		if(!fs.existsSync(`/home/${account}/exports`)){
			fs.mkdir(`/home/${account}/exports`, (err) => {
				if(err) throw err;
			});
		}

		res.render('files/export', {
			title: "Export Files",
			exports: fs.readdirSync(`/home/${account}/exports`),
			no_exports: !(fs.readdirSync(`/home/${account}/exports`).length > 0),
			account: account
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to export and save the
  * users data.
*/
router.post('/export-files', (req, res) => {
	if(req.session.client_loggedin){
		let account = req.session.client_username;
		exec(`sudo bash /usr/local/whmgr/scripts/export.sh ${account}`, (err, export_path) => {
			if(err) throw err;
			else{
				res.redirect('/clientarea/export-files');
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to delete a users
	* exported data.
*/
router.post('/export-delete', (req, res) => {
	if(req.session.client_loggedin){
		let username = req.body.account;
		let export_file = req.body.export;
		if(fs.existsSync(`/home/${username}/exports/${export_file}`)){
			fs.unlink(`/home/${username}/exports/${export_file}`);
			res.redirect('/clientarea/export-files');
		}
		else{
			res.redirect('/clientarea/export-files');
		}
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to get a users exported
  * data.
*/
router.post('/export-get', (req, res) => {
	if(req.session.client_loggedin){
		let account = req.body.account;
		let export_file = req.body.export;
		res.sendFile(`/home/${account}/exports/${export_file}`);	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to get the ftp connection
  * details.
*/
router.get('/ftp-details', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('settings').find({
			name: 'url'
		}).toArray((err, setting) => {
			if(err) throw err;
			else{
				res.render('dash/ftp', {
					title: "FTP Details",
					url: setting[0].value,
					username: req.session.client_username
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

/**
  * Route used to logout the client.
*/
router.get('/logout', (req, res) => {
	req.session.client_loggedin = false;
	res.redirect('/clientarea');
});

/**
  * Route used to hold the home / login page.
*/
router.get('/', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('bills').find({
			account: req.session.client_username
		}).toArray((err, bills) => {
			if(err) throw err;
			else{
				req.db.collection('accounts').find().toArray((err, clients) => {
					res.render('dash/clientarea-home', {
						title: "Clientarea",
						admin_loggedin: req.session.loggedin,
						admin_username: req.session.username,
						client_username: req.session.client_username,
						clients: clients,
						bills: bills
					});
				});
			}
		});
	}
	else{
		res.render('auth/client-login', {
			title: "Login",
			pre_login: true
		});
	}
});

module.exports = router;
