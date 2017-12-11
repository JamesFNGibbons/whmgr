const router = require('express').Router();

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
					res.render('auth/client-login', {
						title: "Login",
						pre_login: true,
						is_root: true
					});
				}
				else{
					req.session.client_loggedin = true;
					req.session.client_username = username;
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
		res.render('dash/clientarea-home', {
			title: "Clientarea"
		})
	}
	else{
		res.render('auth/client-login', {
			title: "Login",
			pre_login: true
		});
	}
});

module.exports = router;