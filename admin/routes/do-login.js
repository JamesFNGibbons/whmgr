const router = require('express').Router();

/**
  * Take the user back to the home
  * screen if there is no application
  * to login to.
*/
router.get('/', (req, res) => {
	res.redirect('/');
});

/**
  * Used to authenticate a user with
	* phpmyadmin.
*/
router.get('/phpmyadmin-auth', (req, res) => {
	if(req.session.loggedin){
		if(req.query.db){
			req.db.collection('databases').find({
				database: req.query.db
			}).toArray((err, docs) => {
				if(err) throw err;
				else{
					if(docs.length > 0){
						req.db.collection('settings').find({name: 'url'}).toArray((err, setting) => {
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
				}
			});
		}
	}
});

/**
  * Used to authenticate a user to the
  * online filemanager.
*/
router.get('/filemanager', (req, res) => {
	if(req.session.client_loggedin){
		req.db.collection('accounts').find({
			username: req.session.client_username
		}).toArray((err, accounts) => {
			if(err) throw err;
			else{
				req.db.collection('settings').find({
					name: 'url'
				}).toArray((err, setting) => {
					if(err) throw err;
					else{
						let url = setting[0].value;
						let account = accounts[0];
						let username = account.username;
						let password = account.password;

						res.redirect(`http://${url}/filemanager?username=${username}&password=${password}&whmgr_login_request`);
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
  * Used to take the user to the phpmyadmin
  * login screen.
*/
router.get('/phpmyadmin', (req, res) => {
	// Get the url of the whmgr
	req.db.collection('settings').find({name: 'url'}).toArray((err, docs) => {
		if(err) throw err;
		else{
			res.redirect('http://' + docs[0].value + '/phpmyadmin');
		}
	});
});

module.exports = router;
